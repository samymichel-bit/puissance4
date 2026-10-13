import 'package:flutter/material.dart';
import '../../ai/connect4_ai.dart';
import '../../controller/game_controller.dart';
import '../../engine/cell.dart';
import '../theme/app_theme.dart';
import '../widgets/board_widget.dart';
import '../widgets/game_controls.dart';
import '../widgets/player_card.dart';
import 'game_over_dialog.dart';
import 'stats_dialog.dart';
import 'multiplayer_dialog.dart';
import 'settings_dialog.dart';
import '../../services/sound_service.dart';
import '../../persistence/stats_repository.dart';
import '../../network/local_multiplayer.dart';

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen> {
  late final GameController _controller;
  final StatsRepository _statsRepo = StatsRepository();
  final LocalMultiplayerService _netService = LocalMultiplayerService();
  bool _isNetworkGame = false;
  BoardThemeType _currentTheme = BoardThemeType.darkNeon;
  final SoundService _soundService = SoundService();
  int _scorePlayer1 = 0;
  int _scorePlayer2 = 0;
  bool _isProcessingAI = false;
  int? _lastCol;
  int? _lastRow;

  @override
  void initState() {
    super.initState();
    _statsRepo.load();
    _setupNetworkCallbacks();
    _controller = GameController(
      mode: GameMode.pveAI,
      aiDifficulty: AIDifficulty.medium,
    );
  }

  void _setupNetworkCallbacks() {
    _netService.onRemoteMove = (col) {
      if (!mounted) return;
      setState(() {
        _controller.playMove(col);
        _lastCol = col;
        _lastRow = _controller.history.last.row;
      });
      _checkGameEnd();
    };
    _netService.onRemoteRestart = () {
      if (!mounted) return;
      _resetGame(sendRemote: false);
    };
    _netService.onDisconnected = () {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Adversaire déconnecté.')),
      );
      setState(() => _isNetworkGame = false);
    };
  }

  void _onColumnTap(int col) {
    if (_isProcessingAI || _controller.isGameOver) return;
    if (_isNetworkGame && _netService.role == NetworkRole.client && _controller.currentPlayer == CellState.player1) return;
    if (_isNetworkGame && _netService.role == NetworkRole.host && _controller.currentPlayer == CellState.player2) return;

    final played = _controller.playMove(col);
    if (!played) return;

    if (_isNetworkGame) {
      _netService.sendMove(col);
    }

    _soundService.playDrop();
    setState(() {
      _lastCol = col;
      _lastRow = _controller.history.last.row;
    });
    _checkGameEnd();

    if (!_controller.isGameOver && _controller.isAITurn) {
      _executeAIMove();
    }
  }

  void _openSettingsDialog() {
    showDialog(
      context: context,
      builder: (_) => SettingsDialog(
        currentTheme: _currentTheme,
        onThemeChanged: (newTheme) {
          setState(() => _currentTheme = newTheme);
        },
      ),
    );
  }

  void _unusedMethod() {
    if (_isProcessingAI || _controller.isGameOver) return;

    final played = _controller.playMove(col);
    if (!played) return;

    _soundService.playDrop();
    setState(() {
      _lastCol = col;
      _lastRow = _controller.history.last.row;
    });
    _checkGameEnd();

    if (!_controller.isGameOver && _controller.isAITurn) {
      _executeAIMove();
    }
  }

  void _executeAIMove() async {
    setState(() => _isProcessingAI = true);
    await Future.delayed(const Duration(milliseconds: 450));

    if (mounted && !_controller.isGameOver) {
      final col = _controller.triggerAIMove();
      setState(() {
        _isProcessingAI = false;
        if (col != -1) {
          _lastCol = col;
          _lastRow = _controller.history.last.row;
        }
      });
      _checkGameEnd();

      if (_controller.mode == GameMode.aiVsAi && !_controller.isGameOver) {
        _executeAIMove();
      }
    } else {
      setState(() => _isProcessingAI = false);
    }
  }

  void _checkGameEnd() {
    if (_controller.isGameOver) {
      _soundService.playWin();
      final isVsAI = (_controller.mode == GameMode.pveAI);
      if (_controller.status == GameStatus.winPlayer1) {
        _scorePlayer1++;
        _statsRepo.recordWin(isVsAI: isVsAI);
      } else if (_controller.status == GameStatus.winPlayer2) {
        _scorePlayer2++;
        _statsRepo.recordLoss(isVsAI: isVsAI);
      } else if (_controller.status == GameStatus.draw) {
        _statsRepo.recordDraw();
      }

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (_) => GameOverDialog(
          status: _controller.status,
          onRestart: _resetGame,
        ),
      );
    }
  }

  void _resetGame({bool sendRemote = true}) {
    if (_isNetworkGame && sendRemote) {
      _netService.sendRestart();
    }
    setState(() {
      _controller.reset();
      _isProcessingAI = false;
    });
    if (_controller.mode == GameMode.aiVsAi) {
      _executeAIMove();
    }
  }

  void _undoMove() {
    if (_isProcessingAI) return;
    setState(() {
      _controller.undoMove();
    });
  }

  void _showModeSettings() {
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) {
        return Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Modes de jeu',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: const Icon(Icons.people, color: Colors.blueAccent),
                title: const Text('Joueur vs Joueur (Local)'),
                subtitle: const Text('2 joueurs sur le même écran'),
                onTap: () {
                  Navigator.pop(ctx);
                  _changeMode(GameMode.pvpLocal, AIDifficulty.medium);
                },
              ),
              ListTile(
                leading: const Icon(Icons.smart_toy, color: Colors.amber),
                title: const Text('Joueur vs IA (Moyen)'),
                subtitle: const Text('Mode recommandé avec blocage et tactique'),
                onTap: () {
                  Navigator.pop(ctx);
                  _changeMode(GameMode.pveAI, AIDifficulty.medium);
                },
              ),
              ListTile(
                leading: const Icon(Icons.psychology, color: Colors.redAccent),
                title: const Text('Joueur vs IA (Difficile)'),
                subtitle: const Text('Heuristique avancée de positionnement'),
                onTap: () {
                  Navigator.pop(ctx);
                  _changeMode(GameMode.pveAI, AIDifficulty.hard);
                },
              ),
              ListTile(
                leading: const Icon(Icons.play_circle_fill, color: Colors.green),
                title: const Text('Démonstration (IA vs IA)'),
                subtitle: const Text('Match automatique entre deux IA'),
                onTap: () {
                  Navigator.pop(ctx);
                  _changeMode(GameMode.aiVsAi, AIDifficulty.medium);
                },
              ),
              const Divider(color: Colors.white24),
              ListTile(
                leading: const Icon(Icons.wifi, color: AppColors.boardAccent),
                title: const Text('Multijoueur Wi-Fi Local'),
                subtitle: const Text('Jouer contre un autre téléphone sur le même réseau'),
                onTap: () {
                  Navigator.pop(ctx);
                  _openMultiplayerDialog();
                },
              ),
            ],
          ),
        );
      },
    );
  }

  void _openMultiplayerDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => MultiplayerDialog(
        netService: _netService,
        onStartGame: () {
          setState(() {
            _isNetworkGame = true;
            _scorePlayer1 = 0;
            _scorePlayer2 = 0;
            _controller.setMode(GameMode.pvpLocal);
          });
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                _netService.role == NetworkRole.host
                    ? 'Partie démarrée en tant qu Hôte (Joueur 1).'
                    : 'Partie rejointe en tant qu Invité (Joueur 2).',
              ),
            ),
          );
        },
      ),
    );
  }

  void _changeMode(GameMode mode, AIDifficulty diff) {
    setState(() {
      _scorePlayer1 = 0;
      _scorePlayer2 = 0;
      _controller.setMode(mode, aiDifficulty: diff);
    });
    if (mode == GameMode.aiVsAi) {
      _executeAIMove();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isP1 = _controller.currentPlayer == CellState.player1;
    final p2Name = (_controller.mode == GameMode.pvpLocal) ? 'Joueur 2' : 'IA Spark';

    final activeTheme = AppThemes.getTheme(_currentTheme);
    return Scaffold(
      backgroundColor: activeTheme.background,
      appBar: AppBar(
        title: const Text(
          'PUISSANCE 4',
          style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1.5),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.leaderboard, color: AppColors.boardAccent),
            tooltip: 'Statistiques',
            onPressed: () {
              showDialog(
                context: context,
                builder: (_) => StatsDialog(
                  stats: _statsRepo.stats,
                  onReset: () => setState(() => _statsRepo.reset()),
                ),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Bandeau des Joueurs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  PlayerCard(
                    name: 'Joueur 1',
                    player: CellState.player1,
                    isCurrent: isP1 && !_controller.isGameOver,
                    score: _scorePlayer1,
                  ),
                  PlayerCard(
                    name: p2Name,
                    player: CellState.player2,
                    isCurrent: !isP1 && !_controller.isGameOver,
                    score: _scorePlayer2,
                  ),
                ],
              ),
            ),
            if (_isProcessingAI)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 4.0),
                child: Text(
                  'IA en réflexion...',
                  style: TextStyle(fontSize: 12, color: Colors.amberAccent),
                ),
              ),

            // Grille de jeu
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12.0),
                child: BoardWidget(
                  board: _controller.board,
                  onColumnTap: _onColumnTap,
                  isInteractive: !_isProcessingAI && !_controller.isGameOver,
                  lastDroppedCol: _lastCol,
                  lastDroppedRow: _lastRow,
                ),
              ),
            ),

            // Contrôles
            GameControls(
              onUndo: _undoMove,
              onReset: _resetGame,
              onModeSelect: _openSettingsDialog,
              canUndo: _controller.history.isNotEmpty && !_isProcessingAI,
            ),
          ],
        ),
      ),
    );
  }
}
