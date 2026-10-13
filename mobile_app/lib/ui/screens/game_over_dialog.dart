import 'package:flutter/material.dart';
import '../../controller/game_controller.dart';
import '../theme/app_theme.dart';

class GameOverDialog extends StatelessWidget {
  final GameStatus status;
  final VoidCallback onRestart;

  const GameOverDialog({
    super.key,
    required this.status,
    required this.onRestart,
  });

  @override
  Widget build(BuildContext context) {
    String title;
    String subtitle;
    Color accentColor;

    if (status == GameStatus.winPlayer1) {
      title = 'Victoire Joueur 1 !';
      subtitle = 'Les jetons rouges l emportent.';
      accentColor = AppColors.player1Red;
    } else if (status == GameStatus.winPlayer2) {
      title = 'Victoire Joueur 2 / IA !';
      subtitle = 'Les jetons jaunes l emportent.';
      accentColor = AppColors.player2Yellow;
    } else {
      title = 'Match Nul !';
      subtitle = 'La grille est pleine sans alignement.';
      accentColor = Colors.blueGrey;
    }

    return AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: accentColor, width: 2),
      ),
      title: Text(
        title,
        textAlign: TextAlign.center,
        style: TextStyle(
          color: accentColor,
          fontWeight: FontWeight.bold,
          fontSize: 22,
        ),
      ),
      content: Text(
        subtitle,
        textAlign: TextAlign.center,
        style: const TextStyle(color: Colors.white70, fontSize: 16),
      ),
      actionsAlignment: MainAxisAlignment.center,
      actions: [
        ElevatedButton.icon(
          onPressed: () {
            Navigator.of(context).pop();
            onRestart();
          },
          icon: const Icon(Icons.replay),
          label: const Text('Rejouer'),
          style: ElevatedButton.styleFrom(
            backgroundColor: accentColor,
            foregroundColor: Colors.black,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      ],
    );
  }
}
