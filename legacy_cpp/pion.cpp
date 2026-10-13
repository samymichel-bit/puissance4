#include "pion.h"

Pion::Pion() : symbole(' '), joueurId(0) {}

Pion::Pion(char s, int id) : symbole(s), joueurId(id) {}

char Pion::getSymbole() const {
    return symbole;
}

void Pion::setSymbole(char s) {
    symbole = s;
}

int Pion::getJoueurId() const {
    return joueurId;
}

void Pion::setJoueurId(int id) {
    joueurId = id;
}

bool Pion::estVide() const {
    return symbole == ' ' || joueurId == 0;
}
