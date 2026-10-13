import 'package:flutter/material.dart';
import '../../persistence/stats_repository.dart';
import '../theme/app_theme.dart';

class StatsDialog extends StatelessWidget {
  final GameStats stats;
  final VoidCallback onReset;

  const StatsDialog({
    super.key,
    required this.stats,
    required this.onReset,
  });

  Widget _buildStatRow(String label, String value, {Color? color}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 14)),
          Text(
            value,
            style: TextStyle(
              color: color ?? Colors.white,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final winRatio = stats.totalGames > 0
        ? ((stats.winsPlayer1 / stats.totalGames) * 100).toStringAsFixed(1)
        : '0.0';

    return AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.boardAccent, width: 1.5),
      ),
      title: const Row(
        children: [
          Icon(Icons.leaderboard, color: AppColors.boardAccent),
          SizedBox(width: 10),
          Text(
            'Statistiques de jeu',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildStatRow('Parties jouées', '${stats.totalGames}'),
            _buildStatRow('Victoires Joueur 1', '${stats.winsPlayer1}', color: AppColors.player1Red),
            _buildStatRow('Victoires Joueur 2 / IA', '${stats.winsPlayer2}', color: AppColors.player2Yellow),
            _buildStatRow('Victoires vs IA', '${stats.winsAgainstAI}', color: Colors.greenAccent),
            _buildStatRow('Défaites vs IA', '${stats.lossesAgainstAI}', color: Colors.orangeAccent),
            _buildStatRow('Matchs nuls', '${stats.draws}', color: Colors.blueGrey),
            const Divider(color: Colors.white24, height: 20),
            _buildStatRow('Taux de victoire J1', '$winRatio %', color: AppColors.boardAccent),
            _buildStatRow('Série actuelle', '${stats.currentStreak}'),
            _buildStatRow('Meilleure série', '${stats.bestStreak}', color: Colors.amber),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () {
            onReset();
            Navigator.pop(context);
          },
          child: const Text('Réinitialiser', style: TextStyle(color: Colors.redAccent)),
        ),
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.boardAccent,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('Fermer'),
        ),
      ],
    );
  }
}
