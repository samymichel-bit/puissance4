import 'cell.dart';

class Board {
  static const int rows = 6;
  static const int cols = 7;

  final List<List<CellState>> _grid;
  List<BoardCoord> _winningCoords = [];

  Board()
      : _grid = List.generate(
          rows,
          (_) => List.filled(cols, CellState.empty),
        );

  Board._fromGrid(List<List<CellState>> grid, List<BoardCoord> winning)
      : _grid = grid.map((row) => List<CellState>.from(row)).toList(),
        _winningCoords = List<BoardCoord>.from(winning);

  List<BoardCoord> get winningCoords => List.unmodifiable(_winningCoords);

  void reset() {
    for (int r = 0; r < rows; ++r) {
      for (int c = 0; c < cols; ++c) {
        _grid[r][c] = CellState.empty;
      }
    }
    _winningCoords.clear();
  }

  int getLowestEmptyRow(int col) {
    if (col < 0 || col >= cols) return -1;
    for (int r = rows - 1; r >= 0; --r) {
      if (_grid[r][col] == CellState.empty) {
        return r;
      }
    }
    return -1;
  }

  bool isColumnFull(int col) {
    if (col < 0 || col >= cols) return true;
    return _grid[0][col] != CellState.empty;
  }

  bool isFull() {
    for (int c = 0; c < cols; ++c) {
      if (!isColumnFull(c)) return false;
    }
    return true;
  }

  bool dropDisc(int col, CellState player) {
    if (col < 0 || col >= cols || player == CellState.empty) return false;
    final r = getLowestEmptyRow(col);
    if (r == -1) return false;

    _grid[r][col] = player;
    return true;
  }

  CellState getCell(int row, int col) {
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      return _grid[row][col];
    }
    return CellState.empty;
  }

  bool checkWin(CellState player) {
    if (player == CellState.empty) return false;
    _winningCoords.clear();

    // 1. Horizontale
    for (int r = 0; r < rows; ++r) {
      for (int c = 0; c <= cols - 4; ++c) {
        if (_grid[r][c] == player &&
            _grid[r][c + 1] == player &&
            _grid[r][c + 2] == player &&
            _grid[r][c + 3] == player) {
          _winningCoords = [
            BoardCoord(r, c),
            BoardCoord(r, c + 1),
            BoardCoord(r, c + 2),
            BoardCoord(r, c + 3),
          ];
          return true;
        }
      }
    }

    // 2. Verticale
    for (int c = 0; c < cols; ++c) {
      for (int r = 0; r <= rows - 4; ++r) {
        if (_grid[r][c] == player &&
            _grid[r + 1][c] == player &&
            _grid[r + 2][c] == player &&
            _grid[r + 3][c] == player) {
          _winningCoords = [
            BoardCoord(r, c),
            BoardCoord(r + 1, c),
            BoardCoord(r + 2, c),
            BoardCoord(r + 3, c),
          ];
          return true;
        }
      }
    }

    // 3. Diagonale descendante (\)
    for (int r = 0; r <= rows - 4; ++r) {
      for (int c = 0; c <= cols - 4; ++c) {
        if (_grid[r][c] == player &&
            _grid[r + 1][c + 1] == player &&
            _grid[r + 2][c + 2] == player &&
            _grid[r + 3][c + 3] == player) {
          _winningCoords = [
            BoardCoord(r, c),
            BoardCoord(r + 1, c + 1),
            BoardCoord(r + 2, c + 2),
            BoardCoord(r + 3, c + 3),
          ];
          return true;
        }
      }
    }

    // 4. Diagonale montante (/)
    for (int r = 3; r < rows; ++r) {
      for (int c = 0; c <= cols - 4; ++c) {
        if (_grid[r][c] == player &&
            _grid[r - 1][c + 1] == player &&
            _grid[r - 2][c + 2] == player &&
            _grid[r - 3][c + 3] == player) {
          _winningCoords = [
            BoardCoord(r, c),
            BoardCoord(r - 1, c + 1),
            BoardCoord(r - 2, c + 2),
            BoardCoord(r - 3, c + 3),
          ];
          return true;
        }
      }
    }

    return false;
  }

  Board clone() => Board._fromGrid(_grid, _winningCoords);
}
