#ifndef GRILLE_H
#define GRILLE_H
#include "pion.h"
#include <vector>

class Grille {
private:
    static const int nbLignes = 6;
    static const int nbColonnes = 7;
    std::vector<std::vector<Pion>> cases;
    std::vector<Position> positionsGagnantes;

public:
    Grille();
    void afficher(char sym1 = 'X', char sym2 = 'O') const;
    bool ouValide(int colonne) const;
    bool placer(Pion pion, int colonne);
    bool estPleine() const;
    bool verifierVictoire(int colonne, char couleur);
};

#endif

