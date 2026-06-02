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
IA::IA() : Joueur("Ordinateur", 'O'), difficulte(STANDARD) {
    std::srand(std::time(0));
    table = new Transposition[TABLE_SIZE];
    for (int i = 0; i < TABLE_SIZE; i++) table[i].hash = 0;
    for(int i=0; i<64; i++) killerMoves[i][0] = killerMoves[i][1] = -1;
    for(int i=0; i<2; i++) for(int j=0; j<7; j++) historyHeuristic[i][j] = 0;
}
IA::IA(std::string nom, char symbole, Difficulte diff) : Joueur(nom, symbole), difficulte(diff) {
    std::srand(std::time(0));
    table = new Transposition[TABLE_SIZE];
    for (int i = 0; i < TABLE_SIZE; i++) table[i].hash = 0;
    for(int i=0; i<64; i++) killerMoves[i][0] = killerMoves[i][1] = -1;
    for(int i=0; i<2; i++) for(int j=0; j<7; j++) historyHeuristic[i][j] = 0;
}

IA::~IA() {
    delete[] table;
}

int IA::choisirCoup(const Grille& grille) const {
    int profondeurMax;
    switch(difficulte) {
        case STANDARD: profondeurMax = 8;  break;  // Ancien Facile++
        case EXPERT:   profondeurMax = 16; break;  // Ancien Doué+
        case MAITRE:   profondeurMax = 26; break;  // Surpasse Pro/Légendaire
        default:       profondeurMax = 8;  break;
    }

    std::cout << nom << " réfléchit..." << std::endl;
    
    for (int i = 0; i < TABLE_SIZE; i++) table[i].hash = 0;

    Grille grilleCopie = grille;
    int meilleurCoupGlobal = -1;
    
    for (int d = 1; d <= profondeurMax; d++) {
        int meilleurScore = -2000000;
        int meilleurCoupIter = -1;
        
        // Ordonnancement simplifié pour le premier niveau
        int moves[7];
        int count = 0;
        int staticOrdre[] = {3, 2, 4, 1, 5, 0, 6};
        
        if (meilleurCoupGlobal != -1 && grilleCopie.ouValide(meilleurCoupGlobal)) moves[count++] = meilleurCoupGlobal;
        for (int m : staticOrdre) if (m != meilleurCoupGlobal && grilleCopie.ouValide(m)) moves[count++] = m;

        for (int i = 0; i < count; i++) {
            int j = moves[i];
            grilleCopie.placer(Pion(symbole, Position(0, j)), j);
            int score = minimax(grilleCopie, d - 1, -2000000, 2000000, false);
            grilleCopie.annulerCoup(j);
            
            if (score > meilleurScore) {
                meilleurScore = score;
                meilleurCoupIter = j;
            }
        }
        meilleurCoupGlobal = meilleurCoupIter;
        if (meilleurScore >= 1000000) break;
    }
    
    return meilleurCoupGlobal;
}

int IA::minimax(Grille& grille, int profondeur, int alpha, int beta, bool estMaximisant) const {
    char symboleHumain = (symbole == 'X' ? 'O' : 'X');
    unsigned long long hash = grille.getHash();
    int tableCoup = -1;

    Transposition& entry = table[hash % TABLE_SIZE];
    if (entry.hash == hash && entry.profondeur >= profondeur) {
        if (entry.flag == 0) return entry.score;
        if (entry.flag == 1 && entry.score <= alpha) return entry.score;
        if (entry.flag == 2 && entry.score >= beta) return entry.score;
        tableCoup = entry.meilleurCoup;
    }
    
    if (grille.estVictoire(symbole)) return 1000000 + profondeur;
    if (grille.estVictoire(symboleHumain)) return -1000000 - profondeur;
    if (grille.estPleine() || profondeur == 0) return grille.evaluer(symbole);

    int initialAlpha = alpha;
    int initialBeta = beta;
    int meilleurCoupLocal = -1;

    // Ordonnancement élaboré
    struct ScoredMove { int col; int score; };
    ScoredMove moves[7];
    int count = 0;
    int pIdx = estMaximisant ? grille.getIndexJoueur(symbole) : grille.getIndexJoueur(symboleHumain);

    for (int j = 0; j < 7; j++) {
        if (grille.ouValide(j)) {
            int score = 0;
            if (j == tableCoup) score = 1000000;
            else if (j == killerMoves[profondeur][0] || j == killerMoves[profondeur][1]) score = 900000;
            else score = historyHeuristic[pIdx][j];
            
            // Bonus central statique pour départager l'histoire
            static const int bonus[] = {0, 10, 20, 30, 20, 10, 0};
            score += bonus[j];
            
            moves[count++] = {j, score};
        }
    }
    
    // Tri par insertion (rapide pour 7 éléments)
    for (int i = 1; i < count; i++) {
        ScoredMove key = moves[i];
        int j = i - 1;
        while (j >= 0 && moves[j].score < key.score) {
            moves[j + 1] = moves[j];
            j--;
        }
        moves[j + 1] = key;
    }

    if (estMaximisant) {
        int maxEval = -2000000;
        for (int i = 0; i < count; i++) {
            int j = moves[i].col;
            grille.placer(Pion(symbole, Position(0, j)), j);
            int eval = minimax(grille, profondeur - 1, alpha, beta, false);
            grille.annulerCoup(j);
            
            if (eval > maxEval) {
                maxEval = eval;
                meilleurCoupLocal = j;
            }
            alpha = std::max(alpha, eval);
            if (beta <= alpha) {
                if (j != tableCoup) {
                    killerMoves[profondeur][1] = killerMoves[profondeur][0];
                    killerMoves[profondeur][0] = j;
                }
                historyHeuristic[pIdx][j] += profondeur * profondeur;
                break;
            }
        }
        
        entry.hash = hash;
        entry.score = maxEval;
        entry.profondeur = profondeur;
        entry.meilleurCoup = meilleurCoupLocal;
        if (maxEval <= initialAlpha) entry.flag = 1;
        else if (maxEval >= initialBeta) entry.flag = 2;
        else entry.flag = 0;
        
        return maxEval;
    } else {
        int minEval = 2000000;
        for (int i = 0; i < count; i++) {
            int j = moves[i].col;
            grille.placer(Pion(symboleHumain, Position(0, j)), j);
            int eval = minimax(grille, profondeur - 1, alpha, beta, true);
            grille.annulerCoup(j);
            
            if (eval < minEval) {
                minEval = eval;
                meilleurCoupLocal = j;
            }
            beta = std::min(beta, eval);
            if (beta <= alpha) {
                if (j != tableCoup) {
                    killerMoves[profondeur][1] = killerMoves[profondeur][0];
                    killerMoves[profondeur][0] = j;
                }
                historyHeuristic[pIdx][j] += profondeur * profondeur;
                break;
            }
        }

        entry.hash = hash;
        entry.score = minEval;
        entry.profondeur = profondeur;
        entry.meilleurCoup = meilleurCoupLocal;
        if (minEval <= initialAlpha) entry.flag = 1;
        else if (minEval >= initialBeta) entry.flag = 2;
        else entry.flag = 0;

        return minEval;
    }
}

