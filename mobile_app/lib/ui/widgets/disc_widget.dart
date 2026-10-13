import 'package:flutter/material.dart';
import '../../engine/cell.dart';
import '../theme/app_theme.dart';

class DiscWidget extends StatefulWidget {
  final CellState state;
  final bool isWinning;
  final bool animateDrop;

  const DiscWidget({
    super.key,
    required this.state,
    this.isWinning = false,
    this.animateDrop = false,
  });

  @override
  State<DiscWidget> createState() => _DiscWidgetState();
}

class _DiscWidgetState extends State<DiscWidget> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 750),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    Color primaryColor;
    Color highlightColor;

    switch (widget.state) {
      case CellState.player1:
        primaryColor = AppColors.player1Red;
        highlightColor = AppColors.player1Glow;
        break;
      case CellState.player2:
        primaryColor = AppColors.player2Yellow;
        highlightColor = AppColors.player2Glow;
        break;
      case CellState.empty:
        primaryColor = AppColors.slotEmpty;
        highlightColor = Colors.transparent;
        break;
    }

    Widget discContent = Container(
      margin: const EdgeInsets.all(4.0),
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: primaryColor,
        gradient: widget.state != CellState.empty
            ? RadialGradient(
                center: const Alignment(-0.25, -0.3),
                radius: 0.85,
                colors: [
                  highlightColor,
                  primaryColor,
                  primaryColor.withOpacity(0.85),
                ],
              )
            : null,
        boxShadow: widget.isWinning
            ? [
                BoxShadow(
                  color: AppColors.winGlow.withOpacity(0.95),
                  blurRadius: 18.0,
                  spreadRadius: 4.0,
                ),
              ]
            : (widget.state != CellState.empty
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.35),
                      blurRadius: 4.0,
                      offset: const Offset(1, 2),
                    ),
                  ]
                : null),
        border: widget.isWinning
            ? Border.all(color: Colors.white, width: 3.0)
            : (widget.state == CellState.empty
                ? Border.all(color: Colors.black.withOpacity(0.5), width: 1.5)
                : null),
      ),
    );

    if (widget.isWinning) {
      return ScaleTransition(
        scale: _pulseAnimation,
        child: discContent,
      );
    }

    return discContent;
  }
}
