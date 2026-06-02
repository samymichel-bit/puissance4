#include "grille.h"
#include <iostream>

Grille::Grille() : cases(nbLignes, std::vector<Pion>(nbColonnes)) {
    for (int i = 0; i < nbLignes; i++) {
        for (int j = 0; j < nbColonnes; j++) {
            cases[i][j] = Pion();
        }
    }
}

void Grille::afficher(char sym1, char sym2) const {
    // Effacer le terminal (portable)
    std::cout << "\033[2J\033[1;1H";

    std::cout << "  ";
    for (int j = 0; j < nbColonnes; j++) {
        std::cout << " " << j << " ";
    }
    std::cout << "\n";

    for (int i = 0; i < nbLignes; i++) {
        std::cout << " +";
        for (int j = 0; j < nbColonnes; j++) {
            std::cout << "---+";
        }
        std::cout << "\n |";
        for (int j = 0; j < nbColonnes; j++) {
            bool estGagnant = false;
            for (const auto& pos : positionsGagnantes) {
                if (pos.getX() == i && pos.getY() == j) {
                    estGagnant = true;
                    break;
                }
            }

            char c = cases[i][j].getCouleur();
            if (estGagnant) {
                std::cout << " \033[32m" << c << "\033[0m |"; // Vert pour la victoire
            } else if (c == sym1) {
                std::cout << " \033[31m" << c << "\033[0m |"; // Rouge pour J1
            } else if (c == sym2) {
                std::cout << " \033[34m" << c << "\033[0m |"; // Bleu pour J2
            } else {
                std::cout << "   |"; // Espace vide
            }
        }
        std::cout << "\n";
    }
    std::cout << " +";
    for (int j = 0; j < nbColonnes; j++) {
        std::cout << "---+";
    }
    std::cout << "\n";
}

bool Grille::ouValide(int colonne) const {
    if (colonne < 0 || colonne >= nbColonnes) return false;
    return cases[0][colonne].getCouleur() == '-';
}

bool Grille::placer(Pion pion, int colonne) {
    if (!ouValide(colonne)) return false;
    for (int i = nbLignes - 1; i >= 0; i--) {
        if (cases[i][colonne].getCouleur() == '-') {
            cases[i][colonne] = pion;
            return true;
        }
    }
    return false;
}

bool Grille::estPleine() const {
    for (int j = 0; j < nbColonnes; j++) {
        if (cases[0][j].getCouleur() == '-') return false;
    }
    return true;
}

bool Grille::verifierVictoire(int colonne, char couleur) {
    int ligne = -1;
    for (int i = 0; i < nbLignes; i++) {
        if (cases[i][colonne].getCouleur() == couleur) {
            ligne = i;
            break;
        }
    }
    if (ligne == -1) return false;

    int directions[4][2] = {{0, 1}, {1, 0}, {1, 1}, {1, -1}};
    for (int d = 0; d < 4; d++) {
        std::vector<Position> tempPositions;
        tempPositions.push_back(Position(ligne, colonne));

        for (int sens = -1; sens <= 1; sens += 2) {
            int l = ligne + sens * directions[d][0];
            int c = colonne + sens * directions[d][1];
            while (l >= 0 && l < nbLignes && c >= 0 && c < nbColonnes && cases[l][c].getCouleur() == couleur) {
                tempPositions.push_back(Position(l, c));
                l += sens * directions[d][0];
                c += sens * directions[d][1];
            }
        }

        if (tempPositions.size() >= 4) {
            positionsGagnantes = tempPositions;
            return true;
        }
    }
    return false;
}