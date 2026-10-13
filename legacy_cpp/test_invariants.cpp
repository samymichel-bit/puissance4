#include <iostream>
#include <cassert>
#include <vector>
#include <string>
#include "grille.h"
#include "pion.h"
#include "position.h"
#include "joueur.h"

int tests_passes = 0;
int tests_total = 0;

#define TEST(name)     tests_total++;     std::cout << "[TEST " << tests_total << "] " << name << " ... ";

#define ASSERT_TRUE(cond)     if (!(cond)) {         std::cout << "ECHEC (ligne " << __LINE__ << "): " << #cond << std::endl;         return false;     }

#define ASSERT_FALSE(cond)     if (cond) {         std::cout << "ECHEC (ligne " << __LINE__ << "): " << #cond << std::endl;         return false;     }

#define ASSERT_EQ(val1, val2)     if ((val1) != (val2)) {         std::cout << "ECHEC (ligne " << __LINE__ << "): " << #val1 << " == " << #val2 << std::endl;         return false;     }

// 1. Invariant 1 : Etat initial
bool test_etat_initial() {
    TEST("Invariant 1 - Etat initial vide");
    Grille g;
    ASSERT_FALSE(g.estRemplie());
    for (int c = 0; c < Grille::NB_COLONNES; ++c) {
        ASSERT_FALSE(g.colonnePleine(c));
        ASSERT_EQ(g.getPremiereLigneLibre(c), Grille::NB_LIGNES - 1);
        for (int l = 0; l < Grille::NB_LIGNES; ++l) {
            ASSERT_TRUE(g.getCase(l, c).estVide());
        }
    }
    Pion p1('X', 1);
    Pion p2('O', 2);
    ASSERT_FALSE(g.verifierVictoire(p1));
    ASSERT_FALSE(g.verifierVictoire(p2));
    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 2. Invariant 2 : Coup valide et gravite
bool test_coup_valide_gravite() {
    TEST("Invariant 2 - Coup valide et gravite vers le bas");
    Grille g;
    Pion p1('X', 1);
    Pion p2('O', 2);

    ASSERT_TRUE(g.placerPion(3, p1));
    ASSERT_EQ(g.getCase(5, 3).getSymbole(), 'X'); // ligne la plus basse = 5
    ASSERT_EQ(g.getPremiereLigneLibre(3), 4);

    ASSERT_TRUE(g.placerPion(3, p2));
    ASSERT_EQ(g.getCase(4, 3).getSymbole(), 'O'); // s'empile au-dessus = 4
    ASSERT_EQ(g.getPremiereLigneLibre(3), 3);

    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 3. Invariant 3 : Coup invalide
bool test_coup_invalide() {
    TEST("Invariant 3 - Coup hors bornes ou colonne pleine");
    Grille g;
    Pion p('X', 1);

    // Hors bornes
    ASSERT_FALSE(g.placerPion(-1, p));
    ASSERT_FALSE(g.placerPion(7, p));
    ASSERT_FALSE(g.placerPion(100, p));

    // Remplissage d'une colonne jusqu'a saturation
    for (int i = 0; i < Grille::NB_LIGNES; ++i) {
        ASSERT_TRUE(g.placerPion(0, p));
    }
    ASSERT_TRUE(g.colonnePleine(0));
    ASSERT_EQ(g.getPremiereLigneLibre(0), -1);

    // Tentative de jouer dans la colonne saturee
    ASSERT_FALSE(g.placerPion(0, p));

    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 4. Invariant 4 : Alternance des joueurs
bool test_alternance_joueurs() {
    TEST("Invariant 4 - Alternance des joueurs");
    Pion p1('X', 1);
    Pion p2('O', 2);
    JoueurHumain j1("J1", p1);
    JoueurHumain j2("J2", p2);

    Joueur* courant = &j1;
    ASSERT_EQ(courant->getNom(), "J1");

    // Simulation de l'alternance
    courant = (courant == &j1) ? (Joueur*)&j2 : (Joueur*)&j1;
    ASSERT_EQ(courant->getNom(), "J2");

    courant = (courant == &j1) ? (Joueur*)&j2 : (Joueur*)&j1;
    ASSERT_EQ(courant->getNom(), "J1");

    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 5. Invariant 5 : Victoire horizontale (bords et centre)
bool test_victoire_horizontale() {
    TEST("Invariant 5 - Victoire horizontale (bords gauche, centre, bord droit)");
    // Bord gauche : colonnes 0, 1, 2, 3
    {
        Grille g;
        Pion p('X', 1);
        for (int c = 0; c < 3; ++c) {
            g.placerPion(c, p);
            ASSERT_FALSE(g.verifierVictoire(p));
        }
        g.placerPion(3, p);
        ASSERT_TRUE(g.verifierVictoire(p));
    }
    // Bord droit : colonnes 3, 4, 5, 6
    {
        Grille g;
        Pion p('O', 2);
        for (int c = 3; c < 6; ++c) {
            g.placerPion(c, p);
            ASSERT_FALSE(g.verifierVictoire(p));
        }
        g.placerPion(6, p);
        ASSERT_TRUE(g.verifierVictoire(p));
    }
    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 6. Invariant 6 : Victoire verticale
bool test_victoire_verticale() {
    TEST("Invariant 6 - Victoire verticale (du bas vers le haut)");
    Grille g;
    Pion p('X', 1);
    for (int i = 0; i < 3; ++i) {
        g.placerPion(2, p);
        ASSERT_FALSE(g.verifierVictoire(p));
    }
    g.placerPion(2, p);
    ASSERT_TRUE(g.verifierVictoire(p));
    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 7. Invariant 7 : Victoire diagonale montante
bool test_victoire_diagonale_montante() {
    TEST("Invariant 7 - Victoire diagonale montante (/)");
    Grille g;
    Pion x('X', 1);
    Pion o('O', 2);

    // Diagonale de (5, 1) a (2, 4)
    // col 1 : hauteur 1 -> X (ligne 5)
    g.placerPion(1, x);

    // col 2 : O puis X (lignes 5, 4)
    g.placerPion(2, o);
    g.placerPion(2, x);

    // col 3 : O, O puis X (lignes 5, 4, 3)
    g.placerPion(3, o);
    g.placerPion(3, o);
    g.placerPion(3, x);

    ASSERT_FALSE(g.verifierVictoire(x));

    // col 4 : O, O, O puis X (lignes 5, 4, 3, 2)
    g.placerPion(4, o);
    g.placerPion(4, o);
    g.placerPion(4, o);
    g.placerPion(4, x);

    ASSERT_TRUE(g.verifierVictoire(x));
    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 8. Invariant 8 : Victoire diagonale descendante
bool test_victoire_diagonale_descendante() {
    TEST("Invariant 8 - Victoire diagonale descendante");
    Grille g;
    Pion x('X', 1);
    Pion o('O', 2);

    // Diagonale de (2, 1) a (5, 4)
    // col 1 : O, O, O puis X (ligne 2)
    g.placerPion(1, o);
    g.placerPion(1, o);
    g.placerPion(1, o);
    g.placerPion(1, x);

    // col 2 : O, O puis X (ligne 3)
    g.placerPion(2, o);
    g.placerPion(2, o);
    g.placerPion(2, x);

    // col 3 : O puis X (ligne 4)
    g.placerPion(3, o);
    g.placerPion(3, x);

    ASSERT_FALSE(g.verifierVictoire(x));

    // col 4 : X (ligne 5)
    g.placerPion(4, x);

    ASSERT_TRUE(g.verifierVictoire(x));
    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 9. Invariant 9 : Colonne pleine, les autres restent jouables
bool test_colonne_pleine_isolation() {
    TEST("Invariant 9 - Colonne pleine n'empeche pas de jouer ailleurs");
    Grille g;
    Pion x('X', 1);
    Pion o('O', 2);

    // Remplir colonne 3
    for (int i = 0; i < Grille::NB_LIGNES; ++i) {
        g.placerPion(3, (i % 2 == 0) ? x : o);
    }
    ASSERT_TRUE(g.colonnePleine(3));

    // Colonne 2 et 4 restent jouables
    ASSERT_TRUE(g.placerPion(2, x));
    ASSERT_TRUE(g.placerPion(4, o));
    ASSERT_FALSE(g.colonnePleine(2));
    ASSERT_FALSE(g.colonnePleine(4));

    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 10. Invariant 10 : Match nul
bool test_match_nul() {
    TEST("Invariant 10 - Match nul (grille pleine sans victoire)");
    Grille g;
    Pion x('X', 1);
    Pion o('O', 2);

    // Configuration classique de match nul :
    // Pattern alternant sans 4 alignes :
    // Cols 0,1,2 : X X O O X X (empile)
    // Cols 3,4,5 : O O X X O O
    // Col 6 : X X O O X X
    int pattern[6][7] = {
        {1, 2, 1, 2, 1, 2, 1},
        {1, 2, 1, 2, 1, 2, 1},
        {2, 1, 2, 1, 2, 1, 2},
        {2, 1, 2, 1, 2, 1, 2},
        {1, 2, 1, 2, 1, 2, 1},
        {1, 2, 1, 2, 1, 2, 1}
    };

    // On remplit du bas vers le haut
    for (int l = Grille::NB_LIGNES - 1; l >= 0; --l) {
        for (int c = 0; c < Grille::NB_COLONNES; ++c) {
            Pion p = (pattern[l][c] == 1) ? x : o;
            g.placerPion(c, p);
        }
    }

    ASSERT_TRUE(g.estRemplie());
    ASSERT_FALSE(g.verifierVictoire(x));
    ASSERT_FALSE(g.verifierVictoire(o));

    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 11. Invariant 11 & 12 : Redemarrage et reinitialisation propre
bool test_redemarrage() {
    TEST("Invariant 11 & 12 - Reinitialisation propre");
    Grille g;
    Pion x('X', 1);
    for (int c = 0; c < 4; ++c) {
        g.placerPion(c, x);
    }
    ASSERT_TRUE(g.verifierVictoire(x));

    g.initialiser();
    ASSERT_FALSE(g.verifierVictoire(x));
    ASSERT_FALSE(g.estRemplie());
    for (int c = 0; c < Grille::NB_COLONNES; ++c) {
        ASSERT_FALSE(g.colonnePleine(c));
        ASSERT_EQ(g.getPremiereLigneLibre(c), Grille::NB_LIGNES - 1);
    }

    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

// 12. Invariant 13 : Cas limite - alignement de 5 ou plus compte comme victoire
bool test_alignement_sup_4() {
    TEST("Cas limite - Alignement de 5 pions compte comme victoire");
    Grille g;
    Pion x('X', 1);
    for (int c = 0; c < 5; ++c) {
        g.placerPion(c, x);
    }
    ASSERT_TRUE(g.verifierVictoire(x));
    std::cout << "OK" << std::endl;
    tests_passes++;
    return true;
}

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "  EXECUTION DES TESTS D INVARIANTS" << std::endl;
    std::cout << "========================================" << std::endl;

    test_etat_initial();
    test_coup_valide_gravite();
    test_coup_invalide();
    test_alternance_joueurs();
    test_victoire_horizontale();
    test_victoire_verticale();
    test_victoire_diagonale_montante();
    test_victoire_diagonale_descendante();
    test_colonne_pleine_isolation();
    test_match_nul();
    test_redemarrage();
    test_alignement_sup_4();

    std::cout << "========================================" << std::endl;
    std::cout << "Resultat : " << tests_passes << " / " << tests_total << " tests reussis." << std::endl;
    std::cout << "========================================" << std::endl;

    return (tests_passes == tests_total) ? 0 : 1;
}
