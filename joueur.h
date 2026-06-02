#ifndef JOUEUR_H
#define JOUEUR_H
#include <string>

class Joueur {
protected:
    std::string nom;
    char symbole;

public:
    Joueur();
    Joueur(std::string nom, char symbole);
    virtual ~Joueur() {}

    std::string getNom() const;
    char getSymbole() const;
    void setNom(std::string nom);
    void setSymbole(char symbole);
    virtual int choisirCoup(const class Grille& grille) const = 0;
};

class Humain : public Joueur {
public:
    Humain();
    Humain(std::string nom, char symbole);
    int choisirCoup(const class Grille& grille) const override;
};

#include <unordered_map>

struct Transposition {
    unsigned long long hash;
    int score;
    int profondeur;
    int flag; // 0: Exact, 1: Alpha, 2: Beta
    int meilleurCoup;
};

const int TABLE_SIZE = 1 << 20; // 1 million d'entrées (~32 Mo)

class IA : public Joueur {
public:
    enum Difficulte { STANDARD, EXPERT, MAITRE };

private:
    Difficulte difficulte;
    mutable Transposition* table;
    mutable int killerMoves[64][2];
    mutable int historyHeuristic[2][7];
    
    int minimax(class Grille& grille, int profondeur, int alpha, int beta, bool estMaximisant) const;

public:
    IA();
    IA(std::string nom, char symbole, Difficulte diff = STANDARD);
    ~IA(); // Destructeur pour libérer la table
    int choisirCoup(const class Grille& grille) const override;
    void setDifficulte(Difficulte diff) { difficulte = diff; }
};

#endif

