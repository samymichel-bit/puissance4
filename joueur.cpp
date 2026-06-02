#include "joueur.h"
#include "grille.h"
#include <iostream>
#include <cstdlib>
#include <ctime>

Joueur::Joueur() : nom("Anonyme"), symbole('-') {}
Joueur::Joueur(std::string nom, char symbole) : nom(nom), symbole(symbole) {}

std::string Joueur::getNom() const { return nom; }
char Joueur::getSymbole() const { return symbole; }
void Joueur::setNom(std::string nom) { this->nom = nom; }
void Joueur::setSymbole(char symbole) { this->symbole = symbole; }

// Humain
Humain::Humain() : Joueur() {}
Humain::Humain(std::string nom, char symbole) : Joueur(nom, symbole) {}

int Humain::choisirCoup(const Grille& grille) const {
    int colonne;
    while (true) {
        std::cout << nom << " (" << symbole << "), choisissez une colonne (0-6) : ";
        if (std::cin >> colonne && colonne >= 0 && colonne < 7) {
            if (grille.ouValide(colonne)) {
                return colonne;
            } else {
                std::cout << "La colonne " << colonne << " est pleine. Choisissez-en une autre." << std::endl;
                continue;
            }
        }

        std::cin.clear();
        std::cin.ignore(10000, '\n');
        std::cout << "Entrée invalide. Veuillez entrer un nombre entre 0 et 6." << std::endl;
    }
}

// IA
IA::IA() : Joueur("Ordinateur", 'O') {
    std::srand(std::time(0));
}
IA::IA(std::string nom, char symbole) : Joueur(nom, symbole) {
    std::srand(std::time(0));
}

int IA::choisirCoup(const Grille& grille) const {
    std::cout << nom << " réfléchit..." << std::endl;
    // IA Basique : Colonne aléatoire valide
    std::vector<int> colonnesValides;
    for (int j = 0; j < 7; j++) {
        if (grille.ouValide(j)) {
            colonnesValides.push_back(j);
        }
    }
    
    if (colonnesValides.empty()) return -1;
    
    // Petite pause pour simuler la réflexion
    for(volatile int i=0; i<100000000; i++); 

    return colonnesValides[std::rand() % colonnesValides.size()];
}

