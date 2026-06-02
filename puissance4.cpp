#include "puissance4.h"
#include <iostream>
#include <string>

Puissance4::Puissance4() : joueur1(nullptr), joueur2(nullptr), joueurActuel(nullptr) {}

Puissance4::~Puissance4() {
    nettouyerJoueurs();
}

void Puissance4::nettouyerJoueurs() {
    if (joueur1) delete joueur1;
    if (joueur2) delete joueur2;
    joueur1 = nullptr;
    joueur2 = nullptr;
}

void Puissance4::initialiserPartie() {
    nettouyerJoueurs();
    
    int mode;
    std::cout << "\n=== MENU PUISSANCE 4 ===" << std::endl;
    std::cout << "1. Joueur vs Joueur" << std::endl;
    std::cout << "2. Joueur vs IA" << std::endl;
    std::cout << "3. IA vs IA (Démo)" << std::endl;
    std::cout << "Choix : ";
    while (!(std::cin >> mode) || mode < 1 || mode > 3) {
        std::cin.clear();
        std::cin.ignore(10000, '\n');
        std::cout << "Choix invalide. Réessayez : ";
    }

    std::string n1, n2;
    char s1, s2;

    if (mode == 1) {
        std::cout << "Nom Joueur 1 : "; std::cin >> n1;
        std::cout << "Symbole Joueur 1 : "; std::cin >> s1;
        joueur1 = new Humain(n1, s1);

        std::cout << "Nom Joueur 2 : "; std::cin >> n2;
        while (true) {
            std::cout << "Symbole Joueur 2 (différent de " << s1 << ") : "; std::cin >> s2;
            if (s2 != s1) break;
        }
        joueur2 = new Humain(n2, s2);
    } else if (mode == 2) {
        std::cout << "Votre nom : "; std::cin >> n1;
        std::cout << "Votre symbole : "; std::cin >> s1;
        joueur1 = new Humain(n1, s1);
        s2 = (s1 == 'X') ? 'O' : 'X';
        
        int diff;
        std::cout << "Difficulté IA (1. Standard, 2. Expert, 3. Maître) : ";
        while (!(std::cin >> diff) || diff < 1 || diff > 3) {
            std::cin.clear();
            std::cin.ignore(10000, '\n');
            std::cout << "Choix invalide. Réessayez : ";
        }
        
        IA::Difficulte diffEnum;
        switch(diff) {
            case 1: diffEnum = IA::STANDARD; break;
            case 2: diffEnum = IA::EXPERT; break;
            case 3: diffEnum = IA::MAITRE; break;
            default: diffEnum = IA::STANDARD; break;
        }
        
        joueur2 = new IA("Ordinateur", s2, diffEnum);
        std::string diffNoms[] = {"Standard", "Expert", "Maître"};
        std::cout << "L'ordinateur sera " << s2 << " en mode " << diffNoms[diff-1] << std::endl;
    } else {
        int diff1, diff2;
        std::cout << "Difficulté IA 1 (1-3) : ";
        std::cin >> diff1;
        std::cout << "Difficulté IA 2 (1-3) : ";
        std::cin >> diff2;
        
        auto getDiff = [](int d) {
            if (d == 1) return IA::STANDARD;
            if (d == 2) return IA::EXPERT;
            return IA::MAITRE;
        };

        joueur1 = new IA("IA Alpha", 'X', getDiff(diff1));
        joueur2 = new IA("IA Beta", 'O', getDiff(diff2));
    }

    grille = Grille();
    joueurActuel = joueur1;
}

void Puissance4::switchJoueur() {
    joueurActuel = (joueurActuel == joueur1) ? joueur2 : joueur1;
}

void Puissance4::jouer() {
    char rejouer;
    do {
        initialiserPartie();
        std::cout << "\nDébut de la partie entre " << joueur1->getNom() << " (" << joueur1->getSymbole() << ") et " 
                  << joueur2->getNom() << " (" << joueur2->getSymbole() << ")" << std::endl;
        
        bool gagne = false;
        while (!grille.estPleine()) {
            std::cout << "\033[2J\033[1;1H"; // Efface l'écran et replace le curseur en haut à gauche
            grille.afficher(joueur1->getSymbole(), joueur2->getSymbole());
            int colonne = joueurActuel->choisirCoup(grille);
            Pion pion(joueurActuel->getSymbole(), Position(0, colonne));

            if (grille.placer(pion, colonne)) {
                if (grille.verifierVictoire(colonne, joueurActuel->getSymbole())) {
                    std::cout << "\033[2J\033[1;1H";
                    grille.afficher(joueur1->getSymbole(), joueur2->getSymbole());
                    std::cout << "\n🎉 Félicitations, " << joueurActuel->getNom() << " ! Vous avez gagné !" << std::endl;
                    gagne = true;
                    break;
                }
                switchJoueur();
            }
        }

        if (!gagne) {
            std::cout << "\033[2J\033[1;1H";
            grille.afficher(joueur1->getSymbole(), joueur2->getSymbole());
            std::cout << "\n🤝 Match nul ! La grille est pleine." << std::endl;
        }

        std::cout << "\nVoulez-vous rejouer ? (O/N) : ";
        std::cin >> rejouer;
    } while (rejouer == 'O' || rejouer == 'o');

    std::cout << "Merci d'avoir joué ! À bientôt." << std::endl;
}

