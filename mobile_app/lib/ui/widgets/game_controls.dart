import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class GameControls extends StatelessWidget {
  final VoidCallback onUndo;
  final VoidCallback onReset;
  final VoidCallback onModeSelect;
  final bool canUndo;

  const GameControls({
    super.key,
    required this.onUndo,
    required this.onReset,
    required this.onModeSelect,
    required this.canUndo,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 12.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          ElevatedButton.icon(
            onPressed: canUndo ? onUndo : null,
            icon: const Icon(Icons.undo, size: 18),
            label: const Text('Annuler'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.surface,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          ElevatedButton.icon(
            onPressed: onReset,
            icon: const Icon(Icons.refresh, size: 18),
            label: const Text('Rejouer'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.surface,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          IconButton(
            onPressed: onModeSelect,
            icon: const Icon(Icons.tune, color: AppColors.boardAccent),
            tooltip: 'Modes de jeu & Paramètres',
          ),
        ],
      ),
    );
  }
}
