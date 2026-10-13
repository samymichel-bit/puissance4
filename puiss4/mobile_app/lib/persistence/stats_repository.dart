import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';

class GameStats {
  int totalGames;
  int winsPlayer1;
  int winsPlayer2;
  int winsAgainstAI;
  int lossesAgainstAI;
  int draws;
  int currentStreak;
  int bestStreak;

  GameStats({
    this.totalGames = 0,
    this.winsPlayer1 = 0,
    this.winsPlayer2 = 0,
    this.winsAgainstAI = 0,
    this.lossesAgainstAI = 0,
    this.draws = 0,
    this.currentStreak = 0,
    this.bestStreak = 0,
  });

  Map<String, dynamic> toJson() => {
        'totalGames': totalGames,
        'winsPlayer1': winsPlayer1,
        'winsPlayer2': winsPlayer2,
        'winsAgainstAI': winsAgainstAI,
        'lossesAgainstAI': lossesAgainstAI,
        'draws': draws,
        'currentStreak': currentStreak,
        'bestStreak': bestStreak,
      };

  factory GameStats.fromJson(Map<String, dynamic> json) => GameStats(
        totalGames: json['totalGames'] ?? 0,
        winsPlayer1: json['winsPlayer1'] ?? 0,
        winsPlayer2: json['winsPlayer2'] ?? 0,
        winsAgainstAI: json['winsAgainstAI'] ?? 0,
        lossesAgainstAI: json['lossesAgainstAI'] ?? 0,
        draws: json['draws'] ?? 0,
        currentStreak: json['currentStreak'] ?? 0,
        bestStreak: json['bestStreak'] ?? 0,
      );

  void recordWin(bool isVsAI) {
    totalGames++;
    winsPlayer1++;
    if (isVsAI) {
      winsAgainstAI++;
    }
    currentStreak++;
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  }

  void recordLoss(bool isVsAI) {
    totalGames++;
    winsPlayer2++;
    if (isVsAI) {
      lossesAgainstAI++;
    }
    currentStreak = 0;
  }

  void recordDraw() {
    totalGames++;
    draws++;
    currentStreak = 0;
  }
}

class StatsRepository {
  GameStats _stats = GameStats();
  final String? _storagePath;

  StatsRepository([this._storagePath]);

  GameStats get stats => _stats;

  Future<void> load() async {
    if (_storagePath == null) return;
    try {
      final file = File(_storagePath!);
      if (await file.exists()) {
        final content = await file.readAsString();
        _stats = GameStats.fromJson(jsonDecode(content));
      }
    } catch (e) {
      debugPrint('Erreur chargement stats: $e');
    }
  }

  Future<void> save() async {
    if (_storagePath == null) return;
    try {
      final file = File(_storagePath!);
      await file.writeAsString(jsonEncode(_stats.toJson()));
    } catch (e) {
      debugPrint('Erreur sauvegarde stats: $e');
    }
  }

  void recordWin({required bool isVsAI}) {
    _stats.recordWin(isVsAI);
    save();
  }

  void recordLoss({required bool isVsAI}) {
    _stats.recordLoss(isVsAI);
    save();
  }

  void recordDraw() {
    _stats.recordDraw();
    save();
  }

  void reset() {
    _stats = GameStats();
    save();
  }
}
