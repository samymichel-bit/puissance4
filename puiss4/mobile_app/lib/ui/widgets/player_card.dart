import 'package:flutter/material.dart';
import '../../engine/cell.dart';
import '../theme/app_theme.dart';

class PlayerCard extends StatelessWidget {
  final String name;
  final CellState player;
  final bool isCurrent;
  final int score;

  const PlayerCard({
    super.key,
    required this.name,
    required this.player,
    required this.isCurrent,
    this.score = 0,
  });

  @override
  Widget build(BuildContext context) {
    final discColor = (player == CellState.player1)
        ? AppColors.player1Red
        : AppColors.player2Yellow;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: isCurrent ? AppColors.surface : Colors.transparent,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isCurrent ? discColor : Colors.white10,
          width: isCurrent ? 2 : 1,
        ),
        boxShadow: isCurrent
            ? [
                BoxShadow(
                  color: discColor.withOpacity(0.3),
                  blurRadius: 10,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
      child: Row(
        children: [
          Container(
            width: 22,
            height: 22,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: discColor,
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                name,
                style: TextStyle(
                  fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                  color: Colors.white,
                  fontSize: 15,
                ),
              ),
              Text(
                'Score: $score',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.white60,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
