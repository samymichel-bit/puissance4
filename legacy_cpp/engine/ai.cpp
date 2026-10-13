#include "ai.h"
#include <cstdlib>
#include <vector>

namespace Connect4 {

AI::AI(AIDifficulty diff) : difficulty(diff) {}

int AI::chooseMove(const Board& board, CellState player) const {
    switch (difficulty) {
        case AIDifficulty::EASY:
            return chooseEasy(board);
        case AIDifficulty::MEDIUM:
            return chooseMedium(board, player);
        case AIDifficulty::HARD:
            return chooseHard(board, player);
    }
    return chooseEasy(board);
}

int AI::chooseEasy(const Board& board) const {
    std::vector<int> validCols;
    for (int c = 0; c < Board::COLS; ++c) {
        if (!board.isColumnFull(c)) validCols.push_back(c);
    }
    if (validCols.empty()) return -1;
    return validCols[std::rand() % validCols.size()];
}

int AI::chooseMedium(const Board& board, CellState player) const {
    CellState opp = (player == CellState::PLAYER_1) ? CellState::PLAYER_2 : CellState::PLAYER_1;

    // 1. Victoire immediate
    for (int c = 0; c < Board::COLS; ++c) {
        if (!board.isColumnFull(c)) {
            Board sim = board;
            sim.dropDisc(c, player);
            if (sim.checkWin(player)) return c;
        }
    }

    // 2. Bloquer victoire adverse immediate
    for (int c = 0; c < Board::COLS; ++c) {
        if (!board.isColumnFull(c)) {
            Board sim = board;
            sim.dropDisc(c, opp);
            if (sim.checkWin(opp)) return c;
        }
    }

    // 3. Preferer la colonne centrale
    int mid = Board::COLS / 2;
    if (!board.isColumnFull(mid)) return mid;

    return chooseEasy(board);
}

int AI::evaluateWindow(const CellState window[4], CellState player, CellState opponent) {
    int countPlayer = 0, countEmpty = 0, countOpponent = 0;
    for (int i = 0; i < 4; ++i) {
        if (window[i] == player) countPlayer++;
        else if (window[i] == CellState::EMPTY) countEmpty++;
        else if (window[i] == opponent) countOpponent++;
    }

    int score = 0;
    if (countPlayer == 4) score += 100;
    else if (countPlayer == 3 && countEmpty == 1) score += 5;
    else if (countPlayer == 2 && countEmpty == 2) score += 2;

    if (countOpponent == 3 && countEmpty == 1) score -= 4;

    return score;
}

int AI::scorePosition(const Board& board, CellState player) {
    CellState opp = (player == CellState::PLAYER_1) ? CellState::PLAYER_2 : CellState::PLAYER_1;
    int totalScore = 0;

    // Bonus colonne centrale
    int mid = Board::COLS / 2;
    int centerCount = 0;
    for (int r = 0; r < Board::ROWS; ++r) {
        if (board.getCell(r, mid) == player) centerCount++;
    }
    totalScore += centerCount * 3;

    // Lignes horizontales
    for (int r = 0; r < Board::ROWS; ++r) {
        for (int c = 0; c <= Board::COLS - 4; ++c) {
            CellState window[4] = {
                board.getCell(r, c),
                board.getCell(r, c+1),
                board.getCell(r, c+2),
                board.getCell(r, c+3)
            };
            totalScore += evaluateWindow(window, player, opp);
        }
    }

    // Lignes verticales
    for (int c = 0; c < Board::COLS; ++c) {
        for (int r = 0; r <= Board::ROWS - 4; ++r) {
            CellState window[4] = {
                board.getCell(r, c),
                board.getCell(r+1, c),
                board.getCell(r+2, c),
                board.getCell(r+3, c)
            };
            totalScore += evaluateWindow(window, player, opp);
        }
    }

    // Diagonale descendante
    for (int r = 0; r <= Board::ROWS - 4; ++r) {
        for (int c = 0; c <= Board::COLS - 4; ++c) {
            CellState window[4] = {
                board.getCell(r, c),
                board.getCell(r+1, c+1),
                board.getCell(r+2, c+2),
                board.getCell(r+3, c+3)
            };
            totalScore += evaluateWindow(window, player, opp);
        }
    }

    // Diagonale montante
    for (int r = 3; r < Board::ROWS; ++r) {
        for (int c = 0; c <= Board::COLS - 4; ++c) {
            CellState window[4] = {
                board.getCell(r, c),
                board.getCell(r-1, c+1),
                board.getCell(r-2, c+2),
                board.getCell(r-3, c+3)
            };
            totalScore += evaluateWindow(window, player, opp);
        }
    }

    return totalScore;
}

int AI::chooseHard(const Board& board, CellState player) const {
    int bestScore = -1000000;
    int bestCol = -1;

    for (int c = 0; c < Board::COLS; ++c) {
        if (!board.isColumnFull(c)) {
            Board sim = board;
            sim.dropDisc(c, player);
            if (sim.checkWin(player)) return c; // Victoire immediate

            int score = scorePosition(sim, player);
            if (score > bestScore) {
                bestScore = score;
                bestCol = c;
            }
        }
    }

    return (bestCol != -1) ? bestCol : chooseMedium(board, player);
}

} // namespace Connect4
