enum CellState {
  empty,
  player1,
  player2,
}

class BoardCoord {
  final int row;
  final int col;

  const BoardCoord(this.row, this.col);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BoardCoord &&
          runtimeType == other.runtimeType &&
          row == other.row &&
          col == other.col;

  @override
  int get hashCode => row.hashCode ^ col.hashCode;

  @override
  String toString() => 'BoardCoord($row, $col)';
}
