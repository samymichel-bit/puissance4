#include <iostream>
#include <cassert>
#include "engine/board.h"
#include "engine/ai.h"
#include "engine/game_controller.h"

using namespace Connect4;

int passed = 0;
int total = 0;

#define RUN_TEST(name)     total++;     std::cout << "[TEST " << total << "] " << name << " ... ";

#define CHECK(cond)     if (!(cond)) {         std::cout << "ECHEC (ligne " << __LINE__ << "): " << #cond << std::endl;         return false;     }

bool test_board_invariants() {
    RUN_TEST("Board - Invariants de base et gravite");
    Board b;
    CHECK(!b.isFull());
    CHECK(b.getLowestEmptyRow(3) == 5);
    CHECK(b.dropDisc(3, CellState::PLAYER_1));
    CHECK(b.getCell(5, 3) == CellState::PLAYER_1);
    CHECK(b.getLowestEmptyRow(3) == 4);
    CHECK(!b.checkWin(CellState::PLAYER_1));

    std::cout << "OK" << std::endl;
    passed++;
    return true;
}

bool test_winning_coordinates() {
    RUN_TEST("Board - Capture des coordonnees de victoire");
    Board b;
    for (int c = 0; c < 4; ++c) {
        b.dropDisc(c, CellState::PLAYER_1);
    }
    CHECK(b.checkWin(CellState::PLAYER_1));
    const auto& coords = b.getWinningCoords();
    CHECK(coords.size() == 4);
    for (int i = 0; i < 4; ++i) {
        CHECK(coords[i].row == 5);
        CHECK(coords[i].col == i);
    }

    std::cout << "OK" << std::endl;
    passed++;
    return true;
}

bool test_game_controller_flow_and_undo() {
    RUN_TEST("GameController - Flux de jeu et annulation (Undo)");
    GameController gc(GameMode::PVP_LOCAL);
    CHECK(gc.getCurrentPlayer() == CellState::PLAYER_1);
    CHECK(gc.getStatus() == GameStatus::IN_PROGRESS);

    CHECK(gc.playMove(0)); // P1 en col 0
    CHECK(gc.getCurrentPlayer() == CellState::PLAYER_2);
    CHECK(gc.getHistory().size() == 1);

    CHECK(gc.playMove(1)); // P2 en col 1
    CHECK(gc.getCurrentPlayer() == CellState::PLAYER_1);
    CHECK(gc.getHistory().size() == 2);

    // Test Undo
    CHECK(gc.undoMove());
    CHECK(gc.getCurrentPlayer() == CellState::PLAYER_2);
    CHECK(gc.getHistory().size() == 1);
    CHECK(gc.getBoard().getCell(5, 1) == CellState::EMPTY);
    CHECK(gc.getBoard().getCell(5, 0) == CellState::PLAYER_1);

    std::cout << "OK" << std::endl;
    passed++;
    return true;
}

bool test_ai_decision_and_blocking() {
    RUN_TEST("AI - Niveau Moyen bloque la victoire adverse");
    AI aiMedium(AIDifficulty::MEDIUM);
    Board b;
    // P1 a 3 pions alignes en colonnes 0, 1, 2
    b.dropDisc(0, CellState::PLAYER_1);
    b.dropDisc(1, CellState::PLAYER_1);
    b.dropDisc(2, CellState::PLAYER_1);

    // IA P2 doit obligatoirement jouer en colonne 3 pour bloquer
    int coupIA = aiMedium.chooseMove(b, CellState::PLAYER_2);
    CHECK(coupIA == 3);

    std::cout << "OK" << std::endl;
    passed++;
    return true;
}

bool test_ai_difficulty_hard() {
    RUN_TEST("AI - Niveau Difficile joue un coup valide");
    AI aiHard(AIDifficulty::HARD);
    Board b;
    int coup = aiHard.chooseMove(b, CellState::PLAYER_1);
    CHECK(coup >= 0 && coup < Board::COLS);

    std::cout << "OK" << std::endl;
    passed++;
    return true;
}

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  TESTS DU MOTEUR DECOUPLE (PHASE 2)   " << std::endl;
    std::cout << "========================================" << std::endl;

    test_board_invariants();
    test_winning_coordinates();
    test_game_controller_flow_and_undo();
    test_ai_decision_and_blocking();
    test_ai_difficulty_hard();

    std::cout << "========================================" << std::endl;
    std::cout << "Resultat : " << passed << " / " << total << " tests reussis." << std::endl;
    std::cout << "========================================" << std::endl;

    return (passed == total) ? 0 : 1;
}
