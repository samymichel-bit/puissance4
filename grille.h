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

    // Bitboards pour l'optimisation
    // On utilise 7 bits par colonne (6 pour les pions + 1 bit de séparation)
    // bitboard[0] pour le joueur 1 (X), bitboard[1] pour le joueur 2 (O)
    unsigned long long bitboards[2];
    int nbPions;

    // Table de hachage Zobrist
    static unsigned long long zobristTable[2][nbLignes * nbColonnes];
    static bool zobristInitialisee;
    unsigned long long hashActuel;

    void initialiserZobrist();

public:
    Grille();
    void afficher(char sym1 = 'X', char sym2 = 'O') const;
    bool ouValide(int colonne) const;
    bool placer(Pion pion, int colonne);
    bool estPleine() const;
    bool verifierVictoire(int colonne, char couleur);
    
    // Nouvelles méthodes pour l'IA
    int getNbLignes() const { return nbLignes; }
    int getNbColonnes() const { return nbColonnes; }
    char getCase(int l, int c) const;
    void annulerCoup(int colonne);
    int evaluer(char couleurIA) const;
    bool estVictoire(char couleur) const;
    unsigned long long getHash() const { return hashActuel; }
    
    // Utilitaires bitboard
    unsigned long long getBitboard(int joueur) const { return bitboards[joueur]; }
    int getIndexJoueur(char couleur) const {
        return (couleur == 'X' || couleur == 'x') ? 0 : 1; 
    }
};

#endif

