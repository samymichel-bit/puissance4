#ifndef ENGINE_AI_H
#define ENGINE_AI_H

#include "board.h"

namespace Connect4 {

enum class AIDifficulty { EASY, MEDIUM, HARD };

class AI {
private:
    AIDifficulty difficulty;

    static int evaluateWindow(const CellState window[4], CellState player, CellState opponent);
    static int scorePosition(const Board& board, CellState player);

    int chooseEasy(const Board& board) const;
    int chooseMedium(const Board& board, CellState player) const;
    int chooseHard(const Board& board, CellState player) const;

public:
    AI(AIDifficulty diff = AIDifficulty::MEDIUM);

    void setDifficulty(AIDifficulty diff) { difficulty = diff; }
    AIDifficulty getDifficulty() const { return difficulty; }

    int chooseMove(const Board& board, CellState player) const;
};

} // namespace Connect4

#endif // ENGINE_AI_H
