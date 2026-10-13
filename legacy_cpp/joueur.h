#ifndef JOUEUR_H
#define JOUEUR_H

#include "pion.h"
#include "grille.h"
#include <string>

class Joueur {
protected:
    std::string nom;
    Pion pion;

public:
    Joueur(const std::string& nom, const Pion& p);
    virtual ~Joueur() = default;

    std::string getNom() const;
    Pion getPion() const;

    virtual int choisirCoup(const Grille& grille) = 0;
};

class JoueurHumain : public Joueur {
public:
    JoueurHumain(const std::string& nom, const Pion& p);
    int choisirCoup(const Grille& grille) override;
};

class JoueurIA : public Joueur {
public:
    enum class Niveau { FACILE, MOYEN, DIFFICILE };

private:
    Niveau niveau;

    int coupFacile(const Grille& grille);
    int coupMoyen(const Grille& grille);
    int coupDifficile(const Grille& grille);

    int evaluerFenetre(const Pion fenetre[4], char symbJoueur, char symbAdv) const;
    int scorePosition(const Grille& grille, char symbJoueur) const;

public:
    JoueurIA(const std::string& nom, const Pion& p, Niveau niv = Niveau::MOYEN);
    int choisirCoup(const Grille& grille) override;
    Niveau getNiveau() const;
};

#endif // JOUEUR_H
