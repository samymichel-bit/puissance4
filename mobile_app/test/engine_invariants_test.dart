import 'package:flutter_test/flutter_test.dart';
import 'package:puissance4_mobile/engine/board.dart';
import 'package:puissance4_mobile/engine/cell.dart';
import 'package:puissance4_mobile/controller/game_controller.dart';
import 'package:puissance4_mobile/ai/connect4_ai.dart';

void main() {
  group('Invariants du Puissance 4 (Flutter / Dart)', () {
    test('Invariant 1 - État initial vide', () {
      final board = Board();
      expect(board.isFull(), isFalse);
      for (int c = 0; c < Board.cols; ++c) {
        expect(board.isColumnFull(c), isFalse);
        expect(board.getLowestEmptyRow(c), equals(Board.rows - 1));
      }
      expect(board.checkWin(CellState.player1), isFalse);
      expect(board.checkWin(CellState.player2), isFalse);
    });

    test('Invariant 2 - Coup valide et gravité', () {
      final board = Board();
      expect(board.dropDisc(3, CellState.player1), isTrue);
      expect(board.getCell(5, 3), equals(CellState.player1));
      expect(board.getLowestEmptyRow(3), equals(4));

      expect(board.dropDisc(3, CellState.player2), isTrue);
      expect(board.getCell(4, 3), equals(CellState.player2));
      expect(board.getLowestEmptyRow(3), equals(3));
    });

    test('Invariant 3 - Coup hors limites ou colonne pleine', () {
      final board = Board();
      expect(board.dropDisc(-1, CellState.player1), isFalse);
      expect(board.dropDisc(7, CellState.player1), isFalse);

      for (int i = 0; i < Board.rows; ++i) {
        expect(board.dropDisc(0, CellState.player1), isTrue);
      }
      expect(board.isColumnFull(0), isTrue);
      expect(board.dropDisc(0, CellState.player1), isFalse);
    });

    test('Invariant 4 - Alternance des tours et Undo', () {
      final controller = GameController(mode: GameMode.pvpLocal);
      expect(controller.currentPlayer, equals(CellState.player1));

      controller.playMove(2);
      expect(controller.currentPlayer, equals(CellState.player2));
      expect(controller.history.length, equals(1));

      controller.playMove(3);
      expect(controller.currentPlayer, equals(CellState.player1));
      expect(controller.history.length, equals(2));

      controller.undoMove();
      expect(controller.currentPlayer, equals(CellState.player2));
      expect(controller.history.length, equals(1));
    });

    test('Invariant 5 - Victoire horizontale avec capture des 4 coordonnées', () {
      final board = Board();
      for (int c = 0; c < 3; ++c) {
        board.dropDisc(c, CellState.player1);
        expect(board.checkWin(CellState.player1), isFalse);
      }
      board.dropDisc(3, CellState.player1);
      expect(board.checkWin(CellState.player1), isTrue);
      expect(board.winningCoords.length, equals(4));
    });

    test('Invariant 6 - Victoire verticale', () {
      final board = Board();
      for (int i = 0; i < 3; ++i) {
        board.dropDisc(4, CellState.player1);
      }
      board.dropDisc(4, CellState.player1);
      expect(board.checkWin(CellState.player1), isTrue);
    });

    test('Invariant 7 & 8 - Victoires diagonales montante et descendante', () {
      // Montante
      final bAsc = Board();
      bAsc.dropDisc(1, CellState.player1);
      bAsc.dropDisc(2, CellState.player2);
      bAsc.dropDisc(2, CellState.player1);
      bAsc.dropDisc(3, CellState.player2);
      bAsc.dropDisc(3, CellState.player2);
      bAsc.dropDisc(3, CellState.player1);
      bAsc.dropDisc(4, CellState.player2);
      bAsc.dropDisc(4, CellState.player2);
      bAsc.dropDisc(4, CellState.player2);
      bAsc.dropDisc(4, CellState.player1);
      expect(bAsc.checkWin(CellState.player1), isTrue);

      // Descendante
      final bDesc = Board();
      bDesc.dropDisc(1, CellState.player2);
      bDesc.dropDisc(1, CellState.player2);
      bDesc.dropDisc(1, CellState.player2);
      bDesc.dropDisc(1, CellState.player1);
      bDesc.dropDisc(2, CellState.player2);
      bDesc.dropDisc(2, CellState.player2);
      bDesc.dropDisc(2, CellState.player1);
      bDesc.dropDisc(3, CellState.player2);
      bDesc.dropDisc(3, CellState.player1);
      bDesc.dropDisc(4, CellState.player1);
      expect(bDesc.checkWin(CellState.player1), isTrue);
    });

    test('IA - Niveau Moyen bloque la menace adverse immédiate', () {
      final ai = Connect4AI(difficulty: AIDifficulty.medium);
      final board = Board();
      board.dropDisc(0, CellState.player1);
      board.dropDisc(1, CellState.player1);
      board.dropDisc(2, CellState.player1);

      final move = ai.chooseMove(board, CellState.player2);
      expect(move, equals(3));
    });
  });
}
