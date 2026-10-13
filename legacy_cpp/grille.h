#ifndef GRILLE_H
#define GRILLE_H

#include "pion.h"
#include "position.h"
#include <vector>

class Grille {
public:
    static const int NB_LIGNES = 6;
    static const int NB_COLONNES = 7;

private:
    Pion cases[NB_LIGNES][NB_COLONNES];

public:
    Grille();

    void initialiser();
    bool placerPion(int colonne, const Pion& pion);
    bool colonnePleine(int colonne) const;
    bool estRemplie() const;
    bool verifierVictoire(const Pion& pion) const;

    Pion getCase(int ligne, int colonne) const;
    int getPremiereLigneLibre(int colonne) const;

    void afficher() const;
};

#endif // GRILLE_H
