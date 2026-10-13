#include "grille.h"
#include <iostream>

Grille::Grille() {
    initialiser();
}

void Grille::initialiser() {
    for (int l = 0; l < NB_LIGNES; ++l) {
        for (int c = 0; c < NB_COLONNES; ++c) {
            cases[l][c] = Pion(' ', 0);
        }
    }
}

int Grille::getPremiereLigneLibre(int colonne) const {
    if (colonne < 0 || colonne >= NB_COLONNES) return -1;
    for (int l = NB_LIGNES - 1; l >= 0; --l) {
        if (cases[l][colonne].estVide()) {
            return l;
        }
    }
    return -1;
}

bool Grille::colonnePleine(int colonne) const {
    if (colonne < 0 || colonne >= NB_COLONNES) return true;
    return !cases[0][colonne].estVide();
}

bool Grille::estRemplie() const {
    for (int c = 0; c < NB_COLONNES; ++c) {
        if (!colonnePleine(c)) {
            return false;
        }
    }
    return true;
}

bool Grille::placerPion(int colonne, const Pion& pion) {
    if (colonne < 0 || colonne >= NB_COLONNES) return false;
    int ligne = getPremiereLigneLibre(colonne);
    if (ligne == -1) return false;

    cases[ligne][colonne] = pion;
    return true;
}

Pion Grille::getCase(int ligne, int colonne) const {
    if (ligne >= 0 && ligne < NB_LIGNES && colonne >= 0 && colonne < NB_COLONNES) {
        return cases[ligne][colonne];
    }
    return Pion(' ', 0);
}

bool Grille::verifierVictoire(const Pion& pion) const {
    char s = pion.getSymbole();
    if (s == ' ') return false;

    // 1. Horizontale
    for (int l = 0; l < NB_LIGNES; ++l) {
        for (int c = 0; c <= NB_COLONNES - 4; ++c) {
            if (cases[l][c].getSymbole() == s &&
                cases[l][c+1].getSymbole() == s &&
                cases[l][c+2].getSymbole() == s &&
                cases[l][c+3].getSymbole() == s) {
                return true;
            }
        }
    }

    // 2. Verticale
    for (int c = 0; c < NB_COLONNES; ++c) {
        for (int l = 0; l <= NB_LIGNES - 4; ++l) {
            if (cases[l][c].getSymbole() == s &&
                cases[l+1][c].getSymbole() == s &&
                cases[l+2][c].getSymbole() == s &&
                cases[l+3][c].getSymbole() == s) {
                return true;
            }
        }
    }

    // 3. Diagonale descendante
    for (int l = 0; l <= NB_LIGNES - 4; ++l) {
        for (int c = 0; c <= NB_COLONNES - 4; ++c) {
            if (cases[l][c].getSymbole() == s &&
                cases[l+1][c+1].getSymbole() == s &&
                cases[l+2][c+2].getSymbole() == s &&
                cases[l+3][c+3].getSymbole() == s) {
                return true;
            }
        }
    }

    // 4. Diagonale montante
    for (int l = 3; l < NB_LIGNES; ++l) {
        for (int c = 0; c <= NB_COLONNES - 4; ++c) {
            if (cases[l][c].getSymbole() == s &&
                cases[l-1][c+1].getSymbole() == s &&
                cases[l-2][c+2].getSymbole() == s &&
                cases[l-3][c+3].getSymbole() == s) {
                return true;
            }
        }
    }

    return false;
}

void Grille::afficher() const {
    std::cout << std::endl;
    std::cout << "  1   2   3   4   5   6   7" << std::endl;
    std::cout << "+---+---+---+---+---+---+---+" << std::endl;
    for (int l = 0; l < NB_LIGNES; ++l) {
        std::cout << "|";
        for (int c = 0; c < NB_COLONNES; ++c) {
            std::cout << " " << cases[l][c].getSymbole() << " |";
        }
        std::cout << std::endl;
        std::cout << "+---+---+---+---+---+---+---+" << std::endl;
    }
}
