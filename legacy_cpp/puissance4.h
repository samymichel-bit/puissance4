#ifndef PUISSANCE4_H
#define PUISSANCE4_H

#include "grille.h"
#include "joueur.h"

class Puissance4 {
private:
    Grille grille;
    Joueur* joueur1;
    Joueur* joueur2;
    Joueur* joueurActuel;
    bool partieTerminee;
    Joueur* vainqueur;

    void nettoyerJoueurs();
    void afficherMenu();

public:
    Puissance4();
    ~Puissance4();

    void configurerPartie(int choixMode, int niveauIA = 2);
    void initialiser();
    void jouer();
    void changerJoueur();

    const Grille& getGrille() const { return grille; }
    Joueur* getJoueurActuel() const { return joueurActuel; }
    bool estTerminee() const { return partieTerminee; }
    Joueur* getVainqueur() const { return vainqueur; }
};

#endif // PUISSANCE4_H
