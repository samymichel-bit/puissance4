import 'package:flutter/material.dart';

enum BoardThemeType {
  darkNeon,
  retroWood,
  cyberpunk,
  emerald,
}

class BoardThemeData {
  final String name;
  final Color background;
  final Color surface;
  final Color boardColor;
  final Color boardBorder;
  final Color slotEmpty;
  final Color player1Color;
  final Color player1Glow;
  final Color player2Color;
  final Color player2Glow;
  final Color winGlow;

  const BoardThemeData({
    required this.name,
    required this.background,
    required this.surface,
    required this.boardColor,
    required this.boardBorder,
    required this.slotEmpty,
    required this.player1Color,
    required this.player1Glow,
    required this.player2Color,
    required this.player2Glow,
    required this.winGlow,
  });
}

class AppThemes {
  static const darkNeon = BoardThemeData(
    name: 'Néon Sombre',
    background: Color(0xFF0D1B2A),
    surface: Color(0xFF1B263B),
    boardColor: Color(0xFF1E3A8A),
    boardBorder: Color(0xFF3B82F6),
    slotEmpty: Color(0xFF0F172A),
    player1Color: Color(0xFFEF4444),
    player1Glow: Color(0xFFFF6B6B),
    player2Color: Color(0xFFFBBF24),
    player2Glow: Color(0xFFFFE066),
    winGlow: Color(0xFF10B981),
  );

  static const retroWood = BoardThemeData(
    name: 'Bois Rétro',
    background: Color(0xFF2C1810),
    surface: Color(0xFF3D2314),
    boardColor: Color(0xFF8B4513),
    boardBorder: Color(0xFFD2691E),
    slotEmpty: Color(0xFF1F100B),
    player1Color: Color(0xFFDC2626),
    player1Glow: Color(0xFFF87171),
    player2Color: Color(0xFFF59E0B),
    player2Glow: Color(0xFFFCD34D),
    winGlow: Color(0xFF34D399),
  );

  static const cyberpunk = BoardThemeData(
    name: 'Cyberpunk',
    background: Color(0xFF130924),
    surface: Color(0xFF21103D),
    boardColor: Color(0xFF3C096C),
    boardBorder: Color(0xFF9D4EDD),
    slotEmpty: Color(0xFF0D0317),
    player1Color: Color(0xFFFF007F),
    player1Glow: Color(0xFFFF66B2),
    player2Color: Color(0xFF00F5D4),
    player2Glow: Color(0xFF7BFFF0),
    winGlow: Color(0xFFFFE600),
  );

  static const emerald = BoardThemeData(
    name: 'Émeraude Royale',
    background: Color(0xFF06281E),
    surface: Color(0xFF0C3D2F),
    boardColor: Color(0xFF134E3F),
    boardBorder: Color(0xFF2DD4BF),
    slotEmpty: Color(0xFF041913),
    player1Color: Color(0xFFE11D48),
    player1Glow: Color(0xFFFB7185),
    player2Color: Color(0xFFEAB308),
    player2Glow: Color(0xFFFEF08A),
    winGlow: Color(0xFF38BDF8),
  );

  static BoardThemeData getTheme(BoardThemeType type) {
    switch (type) {
      case BoardThemeType.darkNeon:
        return darkNeon;
      case BoardThemeType.retroWood:
        return retroWood;
      case BoardThemeType.cyberpunk:
        return cyberpunk;
      case BoardThemeType.emerald:
        return emerald;
    }
  }
}

// Fallback direct pour la rétrocompatibilité
class AppColors {
  static const Color background = Color(0xFF0D1B2A);
  static const Color surface = Color(0xFF1B263B);
  static const Color boardBlue = Color(0xFF1E3A8A);
  static const Color boardAccent = Color(0xFF3B82F6);
  static const Color slotEmpty = Color(0xFF0F172A);
  static const Color player1Red = Color(0xFFEF4444);
  static const Color player1Glow = Color(0xFFFF6B6B);
  static const Color player2Yellow = Color(0xFFFBBF24);
  static const Color player2Glow = Color(0xFFFFE066);
  static const Color winGlow = Color(0xFF10B981);
}

class AppTheme {
  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        primary: AppColors.boardAccent,
        surface: AppColors.surface,
      ),
      fontFamily: 'Roboto',
      useMaterial3: true,
    );
  }
}
