import '../ai/connect4_ai.dart';
import '../engine/board.dart';
import '../engine/cell.dart';

enum GameStatus {
  inProgress,
  winPlayer1,
  winPlayer2,
  draw,
}

enum GameMode {
  pvpLocal,
  pveAI,
  aiVsAi,
}

class MoveRecord {
  final int col;
  final int row;
  final CellState player;

  const MoveRecord({
    required this.col,
    required this.row,
    required this.player,
  });
}

class GameController {
  final Board _board;
  CellState _currentPlayer;
  GameStatus _status;
  GameMode _mode;
  Connect4AI _aiPlayer1;
  Connect4AI _aiPlayer2;
  final List<MoveRecord> _moveHistory;

  GameController({
    GameMode mode = GameMode.pvpLocal,
    AIDifficulty aiDifficulty = AIDifficulty.medium,
  })  : _board = Board(),
        _currentPlayer = CellState.player1,
        _status = GameStatus.inProgress,
        _mode = mode,
        _aiPlayer1 = Connect4AI(difficulty: aiDifficulty),
        _aiPlayer2 = Connect4AI(difficulty: aiDifficulty),
        _moveHistory = [] {
    reset();
  }

  Board get board => _board;
  CellState get currentPlayer => _currentPlayer;
  GameStatus get status => _status;
  GameMode get mode => _mode;
  List<MoveRecord> get history => List.unmodifiable(_moveHistory);
  bool get isGameOver => _status != GameStatus.inProgress;
  List<BoardCoord> get winningCoords => _board.winningCoords;

  void setMode(GameMode mode, {AIDifficulty aiDifficulty = AIDifficulty.medium}) {
    _mode = mode;
    _aiPlayer1 = Connect4AI(difficulty: aiDifficulty);
    _aiPlayer2 = Connect4AI(difficulty: aiDifficulty);
    reset();
  }

  void reset() {
    _board.reset();
    _currentPlayer = CellState.player1;
    _status = GameStatus.inProgress;
    _moveHistory.clear();
  }

  bool playMove(int col) {
    if (_status != GameStatus.inProgress) return false;
    if (col < 0 || col >= Board.cols || _board.isColumnFull(col)) return false;

    final row = _board.getLowestEmptyRow(col);
    if (!_board.dropDisc(col, _currentPlayer)) return false;

    _moveHistory.add(MoveRecord(
      col: col,
      row: row,
      player: _currentPlayer,
    ));

    if (_board.checkWin(_currentPlayer)) {
      _status = (_currentPlayer == CellState.player1)
          ? GameStatus.winPlayer1
          : GameStatus.winPlayer2;
    } else if (_board.isFull()) {
      _status = GameStatus.draw;
    } else {
      _currentPlayer = (_currentPlayer == CellState.player1)
          ? CellState.player2
          : CellState.player1;
    }

    return true;
  }

  bool undoMove() {
    if (_moveHistory.isEmpty) return false;

    // En mode PvE, si c'est au tour du joueur humain, annuler 2 coups pour revenir avant le coup de l'IA
    int stepsToUndo = 1;
    if (_mode == GameMode.pveAI &&
        _currentPlayer == CellState.player1 &&
        _moveHistory.length >= 2) {
      stepsToUndo = 2;
    }

    final oldHistory = List<MoveRecord>.from(_moveHistory);
    for (int i = 0; i < stepsToUndo; ++i) {
      if (oldHistory.isNotEmpty) oldHistory.removeLast();
    }

    reset();
    for (final move in oldHistory) {
      playMove(move.col);
    }

    return true;
  }

  bool get isAITurn {
    if (_status != GameStatus.inProgress) return false;
    if (_mode == GameMode.aiVsAi) return true;
    if (_mode == GameMode.pveAI && _currentPlayer == CellState.player2) {
      return true;
    }
    return false;
  }

  int triggerAIMove() {
    if (!isAITurn) return -1;
    final activeAI = (_currentPlayer == CellState.player1) ? _aiPlayer1 : _aiPlayer2;
    final col = activeAI.chooseMove(_board, _currentPlayer);
    if (col != -1) {
      playMove(col);
    }
    return col;
  }
}
