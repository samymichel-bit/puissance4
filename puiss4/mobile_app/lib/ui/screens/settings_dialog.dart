import 'package:flutter/material.dart';
import '../../services/sound_service.dart';
import '../theme/app_theme.dart';

class SettingsDialog extends StatefulWidget {
  final BoardThemeType currentTheme;
  final Function(BoardThemeType) onThemeChanged;

  const SettingsDialog({
    super.key,
    required this.currentTheme,
    required this.onThemeChanged,
  });

  @override
  State<SettingsDialog> createState() => _SettingsDialogState();
}

class _SettingsDialogState extends State<SettingsDialog> {
  final SoundService _soundService = SoundService();
  late BoardThemeType _selectedTheme;

  @override
  void initState() {
    super.initState();
    _selectedTheme = widget.currentTheme;
  }

  @override
  Widget build(BuildContext context) {
    final activeTheme = AppThemes.getTheme(_selectedTheme);

    return AlertDialog(
      backgroundColor: activeTheme.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: activeTheme.boardBorder, width: 1.5),
      ),
      title: const Row(
        children: [
          Icon(Icons.settings, color: Colors.white),
          SizedBox(width: 10),
          Text(
            'Paramètres & Thèmes',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Thème du plateau',
              style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: BoardThemeType.values.map((themeType) {
                final themeData = AppThemes.getTheme(themeType);
                final isSelected = _selectedTheme == themeType;
                return ChoiceChip(
                  label: Text(themeData.name),
                  selected: isSelected,
                  selectedColor: themeData.boardBorder,
                  backgroundColor: themeData.boardColor.withOpacity(0.5),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.white70,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                  ),
                  onSelected: (selected) {
                    if (selected) {
                      setState(() => _selectedTheme = themeType);
                      widget.onThemeChanged(themeType);
                    }
                  },
                );
              }).toList(),
            ),
            const Divider(color: Colors.white24, height: 24),
            const Text(
              'Effets & Retours',
              style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Effets sonores (Audio)', style: TextStyle(fontSize: 14)),
              secondary: const Icon(Icons.volume_up, color: Colors.amber),
              value: _soundService.soundEnabled,
              onChanged: (val) {
                setState(() => _soundService.toggleSound());
              },
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Vibrations tactiles (Haptique)', style: TextStyle(fontSize: 14)),
              secondary: const Icon(Icons.vibration, color: Colors.blueAccent),
              value: _soundService.hapticEnabled,
              onChanged: (val) {
                setState(() => _soundService.toggleHaptic());
              },
            ),
            const Divider(color: Colors.white24, height: 24),
            const Text(
              'À propos',
              style: TextStyle(color: Colors.white70, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 6),
            const Text(
              'Puissance 4 Mobile v1.0.0\nDéveloppé avec Flutter & Dart.\nIA Minimax Alpha-Beta & Multijoueur Local.',
              style: TextStyle(color: Colors.white54, fontSize: 12),
            ),
          ],
        ),
      ),
      actions: [
        ElevatedButton(
          onPressed: () => Navigator.pop(context),
          style: ElevatedButton.styleFrom(
            backgroundColor: activeTheme.boardBorder,
            foregroundColor: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          child: const Text('Fermer'),
        ),
      ],
    );
  }
}
