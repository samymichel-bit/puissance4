import 'package:flutter/material.dart';
import 'ui/screens/game_screen.dart';
import 'ui/theme/app_theme.dart';

void main() {
  runApp(const Puissance4App());
}

class Puissance4App extends StatelessWidget {
  const Puissance4App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Puissance 4 Mobile',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const GameScreen(),
    );
  }
}
