#include "puissance4.h"
#include <iostream>

Puissance4::Puissance4() : joueur1(nullptr), joueur2(nullptr), joueurActuel(nullptr), partieTerminee(false), vainqueur(nullptr) {}

Puissance4::~Puissance4() {
    nettoyerJoueurs();
}

void Puissance4::nettoyerJoueurs() {
    delete joueur1;
    delete joueur2;
    joueur1 = nullptr;
    joueur2 = nullptr;
    joueurActuel = nullptr;
    vainqueur = nullptr;
}

void Puissance4::initialiser() {
    grille.initialiser();
    partieTerminee = false;
    vainqueur = nullptr;
    joueurActuel = joueur1;
}

void Puissance4::afficherMenu() {
    std::cout << "======================================\n";
    std::cout << "         JEU DE PUISSANCE 4           \n";
    std::cout << "======================================\n";
    std::cout << "1. Joueur vs Joueur\n";
    std::cout << "2. Joueur vs IA\n";
    std::cout << "3. IA vs IA (Demonstration)\n";
    std::cout << "Votre choix : ";
}

void Puissance4::configurerPartie(int choixMode, int niveauIA) {
    nettoyerJoueurs();

    JoueurIA::Niveau niv = JoueurIA::Niveau::MOYEN;
    if (niveauIA == 1) niv = JoueurIA::Niveau::FACILE;
    else if (niveauIA == 3) niv = JoueurIA::Niveau::DIFFICILE;

    if (choixMode == 1) {
        joueur1 = new JoueurHumain("Joueur 1", Pion('X', 1));
        joueur2 = new JoueurHumain("Joueur 2", Pion('O', 2));
    } else if (choixMode == 2) {
        joueur1 = new JoueurHumain("Humain", Pion('X', 1));
        joueur2 = new JoueurIA("IA Spark", Pion('O', 2), niv);
    } else {
        joueur1 = new JoueurIA("IA Alpha", Pion('X', 1), niv);
        joueur2 = new JoueurIA("IA Beta", Pion('O', 2), niv);
    }

    initialiser();
}

void Puissance4::changerJoueur() {
    joueurActuel = (joueurActuel == joueur1) ? joueur2 : joueur1;
}

void Puissance4::jouer() {
    afficherMenu();
    int choix = 1;
    if (!(std::cin >> choix) || choix < 1 || choix > 3) {
        choix = 1;
    }

    int niv = 2;
    if (choix >= 2) {
        std::cout << "Niveau de l IA (1=Facile, 2=Moyen, 3=Difficile) : ";
        if (!(std::cin >> niv) || niv < 1 || niv > 3) {
            niv = 2;
        }
    }

    configurerPartie(choix, niv);

    std::cout << "\n--- Debut de la partie ---\n";
    while (!partieTerminee) {
        grille.afficher();

        int coup = joueurActuel->choisirCoup(grille);
        if (coup == -1) break;

        if (grille.placerPion(coup, joueurActuel->getPion())) {
            if (grille.verifierVictoire(joueurActuel->getPion())) {
                grille.afficher();
                std::cout << "\n Felicitations ! " << joueurActuel->getNom() << " a gagne !\n";
                partieTerminee = true;
                vainqueur = joueurActuel;
            } else if (grille.estRemplie()) {
                grille.afficher();
                std::cout << "\n Match nul ! La grille est pleine.\n";
                partieTerminee = true;
                vainqueur = nullptr;
            } else {
                changerJoueur();
            }
        }
    }
}
