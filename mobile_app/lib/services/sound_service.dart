import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

class SoundService {
  static final SoundService _instance = SoundService._internal();
  factory SoundService() => _instance;

  final AudioPlayer _player = AudioPlayer();
  bool soundEnabled = true;
  bool hapticEnabled = true;

  SoundService._internal() {
    _player.setAudioContext(AudioContext(
      android: const AudioContextAndroid(
        isSpeakerphoneOn: true,
        stayAwake: false,
        contentType: AndroidContentType.sonification,
        usageType: AndroidUsageType.game,
        audioFocus: AndroidAudioFocus.none,
      ),
    ));
  }

  Future<void> playDrop() async {
    if (hapticEnabled) {
      HapticFeedback.lightImpact();
    }
    if (!soundEnabled) return;
    try {
      await _player.stop();
      await _player.play(AssetSource('audio/drop.mp3'), volume: 0.8);
    } catch (e) {
      debugPrint('Son drop non disponible: $e');
    }
  }

  Future<void> playWin() async {
    if (hapticEnabled) {
      HapticFeedback.vibrate();
    }
    if (!soundEnabled) return;
    try {
      await _player.stop();
      await _player.play(AssetSource('audio/win.mp3'), volume: 1.0);
    } catch (e) {
      debugPrint('Son win non disponible: $e');
    }
  }

  Future<void> playClick() async {
    if (hapticEnabled) {
      HapticFeedback.selectionClick();
    }
    if (!soundEnabled) return;
    try {
      await _player.stop();
      await _player.play(AssetSource('audio/click.mp3'), volume: 0.5);
    } catch (e) {
      debugPrint('Son click non disponible: $e');
    }
  }

  void toggleSound() {
    soundEnabled = !soundEnabled;
  }

  void toggleHaptic() {
    hapticEnabled = !hapticEnabled;
  }
}
