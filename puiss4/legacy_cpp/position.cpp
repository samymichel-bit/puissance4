#include "position.h"

Position::Position() : ligne(-1), colonne(-1) {}

Position::Position(int l, int c) : ligne(l), colonne(c) {}

int Position::getLigne() const {
    return ligne;
}

int Position::getColonne() const {
    return colonne;
}

void Position::setLigne(int l) {
    ligne = l;
}

void Position::setColonne(int c) {
    colonne = c;
}

bool Position::estValide(int maxLignes, int maxColonnes) const {
    return (ligne >= 0 && ligne < maxLignes && colonne >= 0 && colonne < maxColonnes);
}
