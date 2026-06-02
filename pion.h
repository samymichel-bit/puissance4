#ifndef PION_H
#define PION_H
#include "position.h"

class Pion {
private:
    char couleur;
    Position position;

public:
    Pion();
    Pion(char couleur, Position pos);
    char getCouleur() const;
    Position getPosition() const;
    void setCouleur(char couleur);
    void setPosition(Position pos);
};

#endif

