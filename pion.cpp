#include "pion.h"

Pion::Pion() : couleur('-'), position(Position()) {}
Pion::Pion(char couleur, Position pos) : couleur(couleur), position(pos) {}

char Pion::getCouleur() const { return couleur; }
Position Pion::getPosition() const { return position; }
void Pion::setCouleur(char couleur) { this->couleur = couleur; }
void Pion::setPosition(Position pos) { this->position = pos; }

