import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../engine/board.dart';
import '../../engine/cell.dart';
import '../theme/app_theme.dart';
import 'disc_widget.dart';

class BoardWidget extends StatelessWidget {
  final Board board;
  final Function(int col) onColumnTap;
  final bool isInteractive;
  final int? lastDroppedCol;
  final int? lastDroppedRow;

  const BoardWidget({
    super.key,
    required this.board,
    required this.onColumnTap,
    this.isInteractive = true,
    this.lastDroppedCol,
    this.lastDroppedRow,
  });

  bool _isCoordWinning(int row, int col) {
    return board.winningCoords.any(
      (coord) => coord.row == row && coord.col == col,
    );
  }

  void _handleTap(int col) {
    HapticFeedback.lightImpact();
    onColumnTap(col);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final maxColWidth = constraints.maxWidth / Board.cols;
        final maxRowHeight = constraints.maxHeight / Board.rows;
        final cellSize = maxColWidth < maxRowHeight ? maxColWidth : maxRowHeight;

        final boardWidth = cellSize * Board.cols;
        final boardHeight = cellSize * Board.rows;

        return Center(
          child: Container(
            width: boardWidth,
            height: boardHeight,
            padding: const EdgeInsets.all(8.0),
            decoration: BoxDecoration(
              color: AppColors.boardBlue,
              borderRadius: BorderRadius.circular(24.0),
              border: Border.all(color: AppColors.boardAccent.withOpacity(0.5), width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.5),
                  blurRadius: 20.0,
                  offset: const Offset(0, 10),
                ),
                BoxShadow(
                  color: AppColors.boardAccent.withOpacity(0.2),
                  blurRadius: 15.0,
                  spreadRadius: 1.0,
                ),
              ],
            ),
            child: Row(
              children: List.generate(Board.cols, (col) {
                final isColFull = board.isColumnFull(col);
                return Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: (isInteractive && !isColFull) ? () => _handleTap(col) : null,
                    child: Column(
                      children: List.generate(Board.rows, (row) {
                        final cell = board.getCell(row, col);
                        final isWin = _isCoordWinning(row, col);
                        final isLatest = (col == lastDroppedCol && row == lastDroppedRow);

                        return Expanded(
                          child: TweenAnimationBuilder<double>(
                            tween: Tween<double>(begin: isLatest ? 0.0 : 1.0, end: 1.0),
                            duration: isLatest
                                ? Duration(milliseconds: 250 + (row * 35))
                                : Duration.zero,
                            curve: Curves.bounceOut,
                            builder: (context, scale, child) {
                              return Transform.scale(
                                scale: scale,
                                child: DiscWidget(
                                  state: cell,
                                  isWinning: isWin,
                                ),
                              );
                            },
                          ),
                        );
                      }),
                    ),
                  ),
                );
              }),
            ),
          ),
        );
      },
    );
  }
}
