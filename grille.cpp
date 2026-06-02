#include "grille.h"
#include <iostream>
#include <random>

unsigned long long Grille::zobristTable[2][6 * 7];
bool Grille::zobristInitialisee = false;

void Grille::initialiserZobrist() {
    if (zobristInitialisee) return;
    std::mt19937_64 rng(12345); // Graine fixe pour la reproductibilité
    std::uniform_int_distribution<unsigned long long> dist;
    for (int i = 0; i < 2; i++) {
        for (int j = 0; j < 42; j++) {
            zobristTable[i][j] = dist(rng);
        }
    }
    zobristInitialisee = true;
}

Grille::Grille() : cases(nbLignes, std::vector<Pion>(nbColonnes)), bitboards{0, 0}, nbPions(0), hashActuel(0) {
    initialiserZobrist();
    for (int i = 0; i < nbLignes; i++) {
        for (int j = 0; j < nbColonnes; j++) {
            cases[i][j] = Pion();
        }
    }
}

void Grille::afficher(char sym1, char sym2) const {
    // Effacer le terminal (portable)
    std::cout << "\033[2J\033[1;1H";

    std::cout << "  ";
    for (int j = 0; j < nbColonnes; j++) {
        std::cout << " " << j << " ";
    }
    std::cout << "\n";

    for (int i = 0; i < nbLignes; i++) {
        std::cout << " +";
        for (int j = 0; j < nbColonnes; j++) {
            std::cout << "---+";
        }
        std::cout << "\n |";
        for (int j = 0; j < nbColonnes; j++) {
            bool estGagnant = false;
            for (const auto& pos : positionsGagnantes) {
                if (pos.getX() == i && pos.getY() == j) {
                    estGagnant = true;
                    break;
                }
            }

            char c = cases[i][j].getCouleur();
            if (estGagnant) {
                std::cout << " \033[32m" << c << "\033[0m |"; // Vert pour la victoire
            } else if (c == sym1) {
                std::cout << " \033[31m" << c << "\033[0m |"; // Rouge pour J1
            } else if (c == sym2) {
                std::cout << " \033[34m" << c << "\033[0m |"; // Bleu pour J2
            } else {
                std::cout << "   |"; // Espace vide
            }
        }
        std::cout << "\n";
    }
    std::cout << " +";
    for (int j = 0; j < nbColonnes; j++) {
        std::cout << "---+";
    }
    std::cout << "\n";
}

bool Grille::ouValide(int colonne) const {
    if (colonne < 0 || colonne >= nbColonnes) return false;
    return cases[0][colonne].getCouleur() == '-';
}

bool Grille::placer(Pion pion, int colonne) {
    if (!ouValide(colonne)) return false;
    char couleur = pion.getCouleur();
    int p = getIndexJoueur(couleur);
    
    for (int i = nbLignes - 1; i >= 0; i--) {
        if (cases[i][colonne].getCouleur() == '-') {
            cases[i][colonne] = pion;
            
            // Mise à jour bitboard
            // bit index: colonne * 7 + (nbLignes - 1 - i)
            int row = nbLignes - 1 - i;
            int bit = colonne * 7 + row;
            bitboards[p] |= (1ULL << bit);
            
            // Mise à jour hachage
            hashActuel ^= zobristTable[p][colonne * nbLignes + row];
            nbPions++;
            
            return true;
        }
    }
    return false;
}

void Grille::annulerCoup(int colonne) {
    for (int i = 0; i < nbLignes; i++) {
        char couleur = cases[i][colonne].getCouleur();
        if (couleur != '-') {
            int p = getIndexJoueur(couleur);
            int row = nbLignes - 1 - i;
            int bit = colonne * 7 + row;
            
            bitboards[p] &= ~(1ULL << bit);
            hashActuel ^= zobristTable[p][colonne * nbLignes + row];
            nbPions--;
            
            cases[i][colonne] = Pion();
            break;
        }
    }
}

bool Grille::estPleine() const {
    return nbPions == 42;
}

bool Grille::verifierVictoire(int colonne, char couleur) {
    // Version simplifiée pour l'affichage (met à jour positionsGagnantes)
    if (estVictoire(couleur)) {
        // Si victoire, on remplit positionsGagnantes pour l'affichage vert
        // On réutilise l'ancienne logique pour trouver LES positions exactes
        int ligne = -1;
        for (int i = 0; i < nbLignes; i++) {
            if (cases[i][colonne].getCouleur() == couleur) {
                ligne = i;
                break;
            }
        }
        if (ligne == -1) return false;

        int directions[4][2] = {{0, 1}, {1, 0}, {1, 1}, {1, -1}};
        for (int d = 0; d < 4; d++) {
            std::vector<Position> tempPositions;
            tempPositions.push_back(Position(ligne, colonne));
            for (int sens = -1; sens <= 1; sens += 2) {
                int l = ligne + sens * directions[d][0];
                int c = colonne + sens * directions[d][1];
                while (l >= 0 && l < nbLignes && c >= 0 && c < nbColonnes && cases[l][c].getCouleur() == couleur) {
                    tempPositions.push_back(Position(l, c));
                    l += sens * directions[d][0];
                    c += sens * directions[d][1];
                }
            }
            if (tempPositions.size() >= 4) {
                positionsGagnantes = tempPositions;
                return true;
            }
        }
    }
    return false;
}

char Grille::getCase(int l, int c) const {
    if (l < 0 || l >= nbLignes || c < 0 || c >= nbColonnes) return '?';
    return cases[l][c].getCouleur();
}

bool Grille::estVictoire(char couleur) const {
    int p = getIndexJoueur(couleur);
    unsigned long long b = bitboards[p];
    
    // Horizontal
    unsigned long long m = b & (b >> 7);
    if (m & (m >> 14)) return true;
    // Vertical
    m = b & (b >> 1);
    if (m & (m >> 2)) return true;
    // Diagonal \ (direction -6)
    m = b & (b >> 6);
    if (m & (m >> 12)) return true;
    // Diagonal / (direction -8)
    m = b & (b >> 8);
    if (m & (m >> 16)) return true;
    
    return false;
}

int Grille::evaluer(char couleurIA) const {
    char couleurHumain = (couleurIA == 'X' ? 'O' : 'X');
    int pIA = getIndexJoueur(couleurIA);
    int pHum = 1 - pIA;
    
    unsigned long long bIA = bitboards[pIA];
    unsigned long long bHum = bitboards[pHum];
    unsigned long long vides = ~(bIA | bHum);
    
    int score = 0;

    // Poids positionnels (statiques car rapides)
    static const int poids[6][7] = {
        {3, 4,  7, 10,  7, 4, 3},
        {4, 7, 10, 15, 10, 7, 4},
        {5, 9, 13, 20, 13, 9, 5},
        {5, 9, 13, 20, 13, 9, 5},
        {4, 7, 10, 15, 10, 7, 4},
        {3, 4,  7, 10,  7, 4, 3}
    };

    for (int i = 0; i < nbLignes; i++) {
        for (int j = 0; j < nbColonnes; j++) {
            if (getCase(i, j) == couleurIA) score += poids[i][j];
            else if (getCase(i, j) == couleurHumain) score -= poids[i][j];
        }
    }

    // Fonction utilitaire pour compter les motifs avec bitboards
    auto compterMotifs = [&](unsigned long long b, unsigned long long maskVides, int n) {
        int count = 0;
        int shifts[] = {1, 7, 6, 8}; // V, H, D1, D2
        for (int s : shifts) {
            unsigned long long m = b;
            for (int i = 1; i < n; i++) m &= (b >> (i * s));
            // Pour simplifier, on compte juste les groupes de n
            // Une version plus précise vérifierait si ils sont complétables
            unsigned long long temp = m;
            while (temp) {
                if (temp & 1) count++;
                temp >>= 1;
            }
        }
        return count;
    };

    // Bonus pour alignements de 3 complétables
    score += compterMotifs(bIA, vides, 3) * 100;
    score -= compterMotifs(bHum, vides, 3) * 100;

    return score;
}