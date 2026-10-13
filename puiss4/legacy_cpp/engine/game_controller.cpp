#include "game_controller.h"

namespace Connect4 {

GameController::GameController(GameMode m, AIDifficulty diff)
    : currentPlayer(CellState::PLAYER_1), status(GameStatus::IN_PROGRESS),
      mode(m), aiPlayer1(diff), aiPlayer2(diff) {
    reset();
}

void GameController::setMode(GameMode m, AIDifficulty diff) {
    mode = m;
    aiPlayer1.setDifficulty(diff);
    aiPlayer2.setDifficulty(diff);
    reset();
}

void GameController::reset() {
    board.reset();
    currentPlayer = CellState::PLAYER_1;
    status = GameStatus::IN_PROGRESS;
    moveHistory.clear();
}

bool GameController::playMove(int col) {
    if (status != GameStatus::IN_PROGRESS) return false;
    if (col < 0 || col >= Board::COLS || board.isColumnFull(col)) return false;

    int r = board.getLowestEmptyRow(col);
    if (!board.dropDisc(col, currentPlayer)) return false;

    moveHistory.push_back(MoveRecord(col, r, currentPlayer));

    if (board.checkWin(currentPlayer)) {
        status = (currentPlayer == CellState::PLAYER_1) ? GameStatus::WIN_PLAYER_1 : GameStatus::WIN_PLAYER_2;
    } else if (board.isFull()) {
        status = GameStatus::DRAW;
    } else {
        currentPlayer = (currentPlayer == CellState::PLAYER_1) ? CellState::PLAYER_2 : CellState::PLAYER_1;
    }

    return true;
}

bool GameController::undoMove() {
    if (moveHistory.empty()) return false;

    // Replay depuis le début pour restaurer un état propre garanti
    std::vector<MoveRecord> oldHistory = moveHistory;
    oldHistory.pop_back(); // Supprime le dernier coup

    reset();
    for (const auto& move : oldHistory) {
        playMove(move.col);
    }

    return true;
}

bool GameController::isAITurn() const {
    if (status != GameStatus::IN_PROGRESS) return false;
    if (mode == GameMode::AI_VS_AI) return true;
    if (mode == GameMode::PVE_AI && currentPlayer == CellState::PLAYER_2) return true;
    return false;
}

int GameController::triggerAIMove() {
    if (!isAITurn()) return -1;
    const AI& activeAI = (currentPlayer == CellState::PLAYER_1) ? aiPlayer1 : aiPlayer2;
    int col = activeAI.chooseMove(board, currentPlayer);
    if (col != -1) {
        playMove(col);
    }
    return col;
}

} // namespace Connect4
