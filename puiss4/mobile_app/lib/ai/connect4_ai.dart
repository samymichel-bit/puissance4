import 'dart:math';
import '../engine/board.dart';
import '../engine/cell.dart';

enum AIDifficulty {
  easy,
  medium,
  hard,
}

class Connect4AI {
  final AIDifficulty difficulty;
  final Random _random;

  Connect4AI({
    this.difficulty = AIDifficulty.medium,
    Random? random,
  }) : _random = random ?? Random();

  int chooseMove(Board board, CellState player) {
    switch (difficulty) {
      case AIDifficulty.easy:
        return _chooseEasy(board);
      case AIDifficulty.medium:
        return _chooseMedium(board, player);
      case AIDifficulty.hard:
        return _chooseHard(board, player);
    }
  }

  int _chooseEasy(Board board) {
    final validCols = <int>[];
    for (int c = 0; c < Board.cols; ++c) {
      if (!board.isColumnFull(c)) validCols.add(c);
    }
    if (validCols.isEmpty) return -1;
    return validCols[_random.nextInt(validCols.length)];
  }

  int _chooseMedium(Board board, CellState player) {
    final opp = (player == CellState.player1)
        ? CellState.player2
        : CellState.player1;

    // 1. Victoire immédiate
    for (int c = 0; c < Board.cols; ++c) {
      if (!board.isColumnFull(c)) {
        final sim = board.clone();
        sim.dropDisc(c, player);
        if (sim.checkWin(player)) return c;
      }
    }

    // 2. Bloquer la victoire immédiate de l'adversaire
    for (int c = 0; c < Board.cols; ++c) {
      if (!board.isColumnFull(c)) {
        final sim = board.clone();
        sim.dropDisc(c, opp);
        if (sim.checkWin(opp)) return c;
      }
    }

    // 3. Préférer le centre si disponible
    final mid = Board.cols ~/ 2;
    if (!board.isColumnFull(mid)) return mid;

    return _chooseEasy(board);
  }

  int _evaluateWindow(
    List<CellState> window,
    CellState player,
    CellState opp,
  ) {
    int countPlayer = 0;
    int countEmpty = 0;
    int countOpp = 0;

    for (final cell in window) {
      if (cell == player) {
        countPlayer++;
      } else if (cell == CellState.empty) {
        countEmpty++;
      } else if (cell == opp) {
        countOpp++;
      }
    }

    int score = 0;
    if (countPlayer == 4) {
      score += 1000;
    } else if (countPlayer == 3 && countEmpty == 1) {
      score += 20;
    } else if (countPlayer == 2 && countEmpty == 2) {
      score += 5;
    }

    if (countOpp == 3 && countEmpty == 1) {
      score -= 30; // Pénalité accrue pour contrer les menaces adverses
    }

    return score;
  }

  int _scorePosition(Board board, CellState player) {
    final opp = (player == CellState.player1)
        ? CellState.player2
        : CellState.player1;
    int totalScore = 0;

    // Priorité à la colonne centrale
    final mid = Board.cols ~/ 2;
    int centerCount = 0;
    for (int r = 0; r < Board.rows; ++r) {
      if (board.getCell(r, mid) == player) centerCount++;
    }
    totalScore += centerCount * 6;

    // Lignes horizontales
    for (int r = 0; r < Board.rows; ++r) {
      for (int c = 0; c <= Board.cols - 4; ++c) {
        final window = [
          board.getCell(r, c),
          board.getCell(r, c + 1),
          board.getCell(r, c + 2),
          board.getCell(r, c + 3),
        ];
        totalScore += _evaluateWindow(window, player, opp);
      }
    }

    // Lignes verticales
    for (int c = 0; c < Board.cols; ++c) {
      for (int r = 0; r <= Board.rows - 4; ++r) {
        final window = [
          board.getCell(r, c),
          board.getCell(r + 1, c),
          board.getCell(r + 2, c),
          board.getCell(r + 3, c),
        ];
        totalScore += _evaluateWindow(window, player, opp);
      }
    }

    // Diagonales descendantes
    for (int r = 0; r <= Board.rows - 4; ++r) {
      for (int c = 0; c <= Board.cols - 4; ++c) {
        final window = [
          board.getCell(r, c),
          board.getCell(r + 1, c + 1),
          board.getCell(r + 2, c + 2),
          board.getCell(r + 3, c + 3),
        ];
        totalScore += _evaluateWindow(window, player, opp);
      }
    }

    // Diagonales montantes
    for (int r = 3; r < Board.rows; ++r) {
      for (int c = 0; c <= Board.cols - 4; ++c) {
        final window = [
          board.getCell(r, c),
          board.getCell(r - 1, c + 1),
          board.getCell(r - 2, c + 2),
          board.getCell(r - 3, c + 3),
        ];
        totalScore += _evaluateWindow(window, player, opp);
      }
    }

    return totalScore;
  }

  int _chooseHard(Board board, CellState player) {
    // Ordre de parcours tactique (favorise les colonnes centrales)
    final colOrder = [3, 2, 4, 1, 5, 0, 6];
    final opp = (player == CellState.player1) ? CellState.player2 : CellState.player1;

    // 1. Victoire immédiate
    for (final c in colOrder) {
      if (!board.isColumnFull(c)) {
        final sim = board.clone();
        sim.dropDisc(c, player);
        if (sim.checkWin(player)) return c;
      }
    }

    // 2. Blocage immédiat
    for (final c in colOrder) {
      if (!board.isColumnFull(c)) {
        final sim = board.clone();
        sim.dropDisc(c, opp);
        if (sim.checkWin(opp)) return c;
      }
    }

    // 3. Minimax avec élagage Alpha-Beta (profondeur 4)
    int bestScore = -1000000;
    int bestCol = -1;
    int alpha = -1000000;
    int beta = 1000000;

    for (final c in colOrder) {
      if (!board.isColumnFull(c)) {
        final sim = board.clone();
        sim.dropDisc(c, player);

        final score = _minimax(sim, 3, alpha, beta, false, player);
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
        alpha = max(alpha, bestScore);
        if (beta <= alpha) break;
      }
    }

    return (bestCol != -1) ? bestCol : _chooseMedium(board, player);
  }

  int _minimax(
    Board board,
    int depth,
    int alpha,
    int beta,
    bool isMaximizing,
    CellState aiPlayer,
  ) {
    final opp = (aiPlayer == CellState.player1) ? CellState.player2 : CellState.player1;

    if (board.checkWin(aiPlayer)) return 10000 + depth;
    if (board.checkWin(opp)) return -10000 - depth;
    if (board.isFull() || depth == 0) return _scorePosition(board, aiPlayer);

    final colOrder = [3, 2, 4, 1, 5, 0, 6];

    if (isMaximizing) {
      int maxEval = -1000000;
      for (final c in colOrder) {
        if (!board.isColumnFull(c)) {
          final sim = board.clone();
          sim.dropDisc(c, aiPlayer);
          final evaluation = _minimax(sim, depth - 1, alpha, beta, false, aiPlayer);
          maxEval = max(maxEval, evaluation);
          alpha = max(alpha, evaluation);
          if (beta <= alpha) break;
        }
      }
      return maxEval;
    } else {
      int minEval = 1000000;
      for (final c in colOrder) {
        if (!board.isColumnFull(c)) {
          final sim = board.clone();
          sim.dropDisc(c, opp);
          final evaluation = _minimax(sim, depth - 1, alpha, beta, true, aiPlayer);
          minEval = min(minEval, evaluation);
          beta = min(beta, evaluation);
          if (beta <= alpha) break;
        }
      }
      return minEval;
    }
  }
}
