#ifndef ENGINE_GAME_CONTROLLER_H
#define ENGINE_GAME_CONTROLLER_H

#include "board.h"
#include "ai.h"
#include <vector>

namespace Connect4 {

enum class GameStatus {
    IN_PROGRESS,
    WIN_PLAYER_1,
    WIN_PLAYER_2,
    DRAW
};

enum class GameMode {
    PVP_LOCAL,
    PVE_AI,
    AI_VS_AI
};

struct MoveRecord {
    int col;
    int row;
    CellState player;
    MoveRecord(int c = -1, int r = -1, CellState p = CellState::EMPTY)
        : col(c), row(r), player(p) {}
};

class GameController {
private:
    Board board;
    CellState currentPlayer;
    GameStatus status;
    GameMode mode;
    AI aiPlayer1;
    AI aiPlayer2;
    std::vector<MoveRecord> moveHistory;

public:
    GameController(GameMode m = GameMode::PVP_LOCAL, AIDifficulty diff = AIDifficulty::MEDIUM);

    void reset();
    void setMode(GameMode m, AIDifficulty diff = AIDifficulty::MEDIUM);

    bool playMove(int col);
    bool undoMove();

    bool isAITurn() const;
    int triggerAIMove();

    const Board& getBoard() const { return board; }
    CellState getCurrentPlayer() const { return currentPlayer; }
    GameStatus getStatus() const { return status; }
    GameMode getMode() const { return mode; }
    const std::vector<MoveRecord>& getHistory() const { return moveHistory; }
    bool isGameOver() const { return status != GameStatus::IN_PROGRESS; }
};

} // namespace Connect4

#endif // ENGINE_GAME_CONTROLLER_H
