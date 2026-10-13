#include "joueur.h"
#include <iostream>
#include <cstdlib>
#include <ctime>
#include <vector>

Joueur::Joueur(const std::string& n, const Pion& p) : nom(n), pion(p) {}

std::string Joueur::getNom() const {
    return nom;
}

Pion Joueur::getPion() const {
    return pion;
}

// Joueur Humain
JoueurHumain::JoueurHumain(const std::string& n, const Pion& p) : Joueur(n, p) {}

int JoueurHumain::choisirCoup(const Grille& grille) {
    int col = -1;
    while (true) {
        std::cout << nom << " (" << pion.getSymbole() << "), choisissez une colonne (1-7) : ";
        if (std::cin >> col) {
            col -= 1; // passage a l'index 0
            if (col >= 0 && col < Grille::NB_COLONNES && !grille.colonnePleine(col)) {
                return col;
            }
            std::cout << "Colonne invalide ou pleine. Reessayez." << std::endl;
        } else {
            std::cin.clear();
            std::string ignore;
            std::cin >> ignore;
            std::cout << "Entree non valide. Saisissez un chiffre entre 1 et 7." << std::endl;
        }
    }
}

// Joueur IA
JoueurIA::JoueurIA(const std::string& n, const Pion& p, Niveau niv) : Joueur(n, p), niveau(niv) {
    std::srand(static_cast<unsigned int>(std::time(nullptr)));
}

JoueurIA::Niveau JoueurIA::getNiveau() const {
    return niveau;
}

int JoueurIA::choisirCoup(const Grille& grille) {
    switch (niveau) {
        case Niveau::FACILE:
            return coupFacile(grille);
        case Niveau::MOYEN:
            return coupMoyen(grille);
        case Niveau::DIFFICILE:
            return coupDifficile(grille);
    }
    return coupFacile(grille);
}

int JoueurIA::coupFacile(const Grille& grille) {
    std::vector<int> coupsValides;
    for (int c = 0; c < Grille::NB_COLONNES; ++c) {
        if (!grille.colonnePleine(c)) {
            coupsValides.push_back(c);
        }
    }
    if (coupsValides.empty()) return -1;
    return coupsValides[std::rand() % coupsValides.size()];
}

int JoueurIA::coupMoyen(const Grille& grille) {
    char symbIA = pion.getSymbole();
    char symbAdv = (symbIA == 'X') ? 'O' : 'X';

    // 1. Victoire immediate
    for (int c = 0; c < Grille::NB_COLONNES; ++c) {
        if (!grille.colonnePleine(c)) {
            Grille simulee = grille;
            simulee.placerPion(c, pion);
            if (simulee.verifierVictoire(pion)) {
                return c;
            }
        }
    }

    // 2. Bloquer victoire immediate de l'adversaire
    Pion pionAdv(symbAdv, (pion.getJoueurId() == 1) ? 2 : 1);
    for (int c = 0; c < Grille::NB_COLONNES; ++c) {
        if (!grille.colonnePleine(c)) {
            Grille simulee = grille;
            simulee.placerPion(c, pionAdv);
            if (simulee.verifierVictoire(pionAdv)) {
                return c;
            }
        }
    }

    // 3. Preferer le centre si libre
    int centre = Grille::NB_COLONNES / 2;
    if (!grille.colonnePleine(centre)) {
        return centre;
    }

    return coupFacile(grille);
}

int JoueurIA::evaluerFenetre(const Pion fenetre[4], char symbJoueur, char symbAdv) const {
    int score = 0;
    int nbJoueur = 0, nbVide = 0, nbAdv = 0;

    for (int i = 0; i < 4; ++i) {
        if (fenetre[i].getSymbole() == symbJoueur) nbJoueur++;
        else if (fenetre[i].estVide()) nbVide++;
        else if (fenetre[i].getSymbole() == symbAdv) nbAdv++;
    }

    if (nbJoueur == 4) score += 100;
    else if (nbJoueur == 3 && nbVide == 1) score += 5;
    else if (nbJoueur == 2 && nbVide == 2) score += 2;

    if (nbAdv == 3 && nbVide == 1) score -= 4;

    return score;
}

int JoueurIA::scorePosition(const Grille& grille, char symbJoueur) const {
    char symbAdv = (symbJoueur == 'X') ? 'O' : 'X';
    int scoreTotal = 0;

    int colCentre = Grille::NB_COLONNES / 2;
    int pionsCentre = 0;
    for (int l = 0; l < Grille::NB_LIGNES; ++l) {
        if (grille.getCase(l, colCentre).getSymbole() == symbJoueur) pionsCentre++;
    }
    scoreTotal += pionsCentre * 3;

    // Evaluation horizontale
    for (int l = 0; l < Grille::NB_LIGNES; ++l) {
        for (int c = 0; c <= Grille::NB_COLONNES - 4; ++c) {
            Pion fenetre[4];
            for (int i = 0; i < 4; ++i) fenetre[i] = grille.getCase(l, c + i);
            scoreTotal += evaluerFenetre(fenetre, symbJoueur, symbAdv);
        }
    }

    // Evaluation verticale
    for (int c = 0; c < Grille::NB_COLONNES; ++c) {
        for (int l = 0; l <= Grille::NB_LIGNES - 4; ++l) {
            Pion fenetre[4];
            for (int i = 0; i < 4; ++i) fenetre[i] = grille.getCase(l + i, c);
            scoreTotal += evaluerFenetre(fenetre, symbJoueur, symbAdv);
        }
    }

    // Evaluation diagonale descendante
    for (int l = 0; l <= Grille::NB_LIGNES - 4; ++l) {
        for (int c = 0; c <= Grille::NB_COLONNES - 4; ++c) {
            Pion fenetre[4];
            for (int i = 0; i < 4; ++i) fenetre[i] = grille.getCase(l + i, c + i);
            scoreTotal += evaluerFenetre(fenetre, symbJoueur, symbAdv);
        }
    }

    // Evaluation diagonale montante
    for (int l = 3; l < Grille::NB_LIGNES; ++l) {
        for (int c = 0; c <= Grille::NB_COLONNES - 4; ++c) {
            Pion fenetre[4];
            for (int i = 0; i < 4; ++i) fenetre[i] = grille.getCase(l - i, c + i);
            scoreTotal += evaluerFenetre(fenetre, symbJoueur, symbAdv);
        }
    }

    return scoreTotal;
}

int JoueurIA::coupDifficile(const Grille& grille) {
    char symbIA = pion.getSymbole();
    int meilleurScore = -1000000;
    int meilleurCoup = -1;

    for (int c = 0; c < Grille::NB_COLONNES; ++c) {
        if (!grille.colonnePleine(c)) {
            Grille simulee = grille;
            simulee.placerPion(c, pion);

            if (simulee.verifierVictoire(pion)) {
                return c;
            }

            int score = scorePosition(simulee, symbIA);
            if (score > meilleurScore) {
                meilleurScore = score;
                meilleurCoup = c;
            }
        }
    }

    return (meilleurCoup != -1) ? meilleurCoup : coupMoyen(grille);
}
