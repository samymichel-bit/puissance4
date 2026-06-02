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

class IA : public Joueur {
public:
    IA();
    IA(std::string nom, char symbole);
    int choisirCoup(const class Grille& grille) const override;
};

#endif

