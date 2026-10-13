#include "board.h"

namespace Connect4 {

Board::Board() {
    reset();
}

void Board::reset() {
    for (int r = 0; r < ROWS; ++r) {
        for (int c = 0; c < COLS; ++c) {
            grid[r][c] = CellState::EMPTY;
        }
    }
    winningCoords.clear();
}

int Board::getLowestEmptyRow(int col) const {
    if (col < 0 || col >= COLS) return -1;
    for (int r = ROWS - 1; r >= 0; --r) {
        if (grid[r][col] == CellState::EMPTY) {
            return r;
        }
    }
    return -1;
}

bool Board::isColumnFull(int col) const {
    if (col < 0 || col >= COLS) return true;
    return grid[0][col] != CellState::EMPTY;
}

bool Board::isFull() const {
    for (int c = 0; c < COLS; ++c) {
        if (!isColumnFull(c)) return false;
    }
    return true;
}

bool Board::dropDisc(int col, CellState player) {
    if (col < 0 || col >= COLS || player == CellState::EMPTY) return false;
    int r = getLowestEmptyRow(col);
    if (r == -1) return false;

    grid[r][col] = player;
    return true;
}

CellState Board::getCell(int row, int col) const {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        return grid[row][col];
    }
    return CellState::EMPTY;
}

bool Board::checkWin(CellState player) {
    if (player == CellState::EMPTY) return false;
    winningCoords.clear();

    // 1. Horizontal
    for (int r = 0; r < ROWS; ++r) {
        for (int c = 0; c <= COLS - 4; ++c) {
            if (grid[r][c] == player &&
                grid[r][c+1] == player &&
                grid[r][c+2] == player &&
                grid[r][c+3] == player) {
                winningCoords = { Coord(r, c), Coord(r, c+1), Coord(r, c+2), Coord(r, c+3) };
                return true;
            }
        }
    }

    // 2. Vertical
    for (int c = 0; c < COLS; ++c) {
        for (int r = 0; r <= ROWS - 4; ++r) {
            if (grid[r][c] == player &&
                grid[r+1][c] == player &&
                grid[r+2][c] == player &&
                grid[r+3][c] == player) {
                winningCoords = { Coord(r, c), Coord(r+1, c), Coord(r+2, c), Coord(r+3, c) };
                return true;
            }
        }
    }

    // 3. Diagonale descendante (\)
    for (int r = 0; r <= ROWS - 4; ++r) {
        for (int c = 0; c <= COLS - 4; ++c) {
            if (grid[r][c] == player &&
                grid[r+1][c+1] == player &&
                grid[r+2][c+2] == player &&
                grid[r+3][c+3] == player) {
                winningCoords = { Coord(r, c), Coord(r+1, c+1), Coord(r+2, c+2), Coord(r+3, c+3) };
                return true;
            }
        }
    }

    // 4. Diagonale montante (/)
    for (int r = 3; r < ROWS; ++r) {
        for (int c = 0; c <= COLS - 4; ++c) {
            if (grid[r][c] == player &&
                grid[r-1][c+1] == player &&
                grid[r-2][c+2] == player &&
                grid[r-3][c+3] == player) {
                winningCoords = { Coord(r, c), Coord(r-1, c+1), Coord(r-2, c+2), Coord(r-3, c+3) };
                return true;
            }
        }
    }

    return false;
}

} // namespace Connect4
