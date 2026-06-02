#ifndef PUISSANCE4_H
#define PUISSANCE4_H
#include "joueur.h"
#include "grille.h"

class Puissance4 {
private:
    Joueur* joueur1;
    Joueur* joueur2;
    Grille grille;
    Joueur* joueurActuel;

    void initialiserPartie();
    void switchJoueur();
    void nettouyerJoueurs();

public:
    Puissance4();
    ~Puissance4();
    void jouer();
};

#endif

