import 'package:flutter/material.dart';
import '../../network/local_multiplayer.dart';
import '../theme/app_theme.dart';

class MultiplayerDialog extends StatefulWidget {
  final LocalMultiplayerService netService;
  final VoidCallback onStartGame;

  const MultiplayerDialog({
    super.key,
    required this.netService,
    required this.onStartGame,
  });

  @override
  State<MultiplayerDialog> createState() => _MultiplayerDialogState();
}

class _MultiplayerDialogState extends State<MultiplayerDialog> {
  final TextEditingController _ipController = TextEditingController();
  String? _localIp;
  bool _isHosting = false;
  bool _isConnecting = false;
  String _statusMessage = 'Choisissez un mode de connexion locale (même Wi-Fi ou Hotspot).';

  @override
  void initState() {
    super.initState();
    _fetchLocalIp();
  }

  void _fetchLocalIp() async {
    final ip = await LocalMultiplayerService.getLocalIpAddress();
    if (mounted) {
      setState(() {
        _localIp = ip ?? '127.0.0.1';
      });
    }
  }

  void _hostGame() async {
    setState(() {
      _isHosting = true;
      _statusMessage = 'En attente d un joueur sur l IP : $_localIp:8888...';
    });

    widget.netService.onConnected = () {
      if (mounted) {
        Navigator.pop(context);
        widget.onStartGame();
      }
    };

    final ok = await widget.netService.startHost();
    if (!ok && mounted) {
      setState(() {
        _isHosting = false;
        _statusMessage = 'Impossible de créer le salon local.';
      });
    }
  }

  void _joinGame() async {
    final ip = _ipController.text.trim();
    if (ip.isEmpty) {
      setState(() => _statusMessage = 'Veuillez saisir l IP de l hôte.');
      return;
    }

    setState(() {
      _isConnecting = true;
      _statusMessage = 'Connexion à $ip:8888...';
    });

    widget.netService.onConnected = () {
      if (mounted) {
        Navigator.pop(context);
        widget.onStartGame();
      }
    };

    final ok = await widget.netService.connectToHost(ip);
    if (!ok && mounted) {
      setState(() {
        _isConnecting = false;
        _statusMessage = 'Échec de connexion à $ip. Vérifiez l IP et le réseau Wi-Fi.';
      });
    }
  }

  @override
  void dispose() {
    _ipController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.surface,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: const BorderSide(color: AppColors.boardAccent, width: 1.5),
      ),
      title: const Row(
        children: [
          Icon(Icons.wifi, color: AppColors.boardAccent),
          SizedBox(width: 10),
          Text(
            'Multijoueur Wi-Fi Local',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
        ],
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _statusMessage,
              style: const TextStyle(color: Colors.white70, fontSize: 13),
            ),
            const SizedBox(height: 16),
            if (!_isHosting && !_isConnecting) ...[
              ElevatedButton.icon(
                onPressed: _hostGame,
                icon: const Icon(Icons.hub),
                label: const Text('Héberger une partie'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.player1Red,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 12),
              const Center(
                child: Text('OU', style: TextStyle(color: Colors.white38, fontSize: 12)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _ipController,
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  labelText: 'Adresse IP de l hôte',
                  hintText: 'ex: 192.168.1.50',
                  labelStyle: const TextStyle(color: Colors.white70),
                  hintStyle: const TextStyle(color: Colors.white24),
                  prefixIcon: const Icon(Icons.computer, color: AppColors.boardAccent),
                  filled: true,
                  fillColor: AppColors.background,
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton.icon(
                onPressed: _joinGame,
                icon: const Icon(Icons.login),
                label: const Text('Rejoindre la partie'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.player2Yellow,
                  foregroundColor: Colors.black,
                  minimumSize: const Size.fromHeight(44),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ] else ...[
              const Center(
                child: Padding(
                  padding: EdgeInsets.symmetric(vertical: 20.0),
                  child: CircularProgressIndicator(color: AppColors.boardAccent),
                ),
              ),
              Center(
                child: TextButton(
                  onPressed: () {
                    widget.netService.disconnect();
                    setState(() {
                      _isHosting = false;
                      _isConnecting = false;
                      _statusMessage = 'Connexion annulée.';
                    });
                  },
                  child: const Text('Annuler', style: TextStyle(color: Colors.redAccent)),
                ),
              ),
            ],
          ],
        ),
      ),
      actions: [
        if (!_isHosting && !_isConnecting)
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Fermer', style: TextStyle(color: Colors.white60)),
          ),
      ],
    );
  }
}
