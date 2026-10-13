#ifndef ENGINE_BOARD_H
#define ENGINE_BOARD_H

#include <vector>

namespace Connect4 {

enum class CellState { EMPTY = 0, PLAYER_1 = 1, PLAYER_2 = 2 };

struct Coord {
    int row;
    int col;
    Coord(int r = -1, int c = -1) : row(r), col(c) {}
    bool operator==(const Coord& other) const {
        return row == other.row && col == other.col;
    }
};

class Board {
public:
    static const int ROWS = 6;
    static const int COLS = 7;

private:
    CellState grid[ROWS][COLS];
    std::vector<Coord> winningCoords;

public:
    Board();

    void reset();
    int getLowestEmptyRow(int col) const;
    bool isColumnFull(int col) const;
    bool isFull() const;
    bool dropDisc(int col, CellState player);
    CellState getCell(int row, int col) const;
    bool checkWin(CellState player);
    const std::vector<Coord>& getWinningCoords() const { return winningCoords; }
};

} // namespace Connect4

#endif // ENGINE_BOARD_H
