# Puissance 4 - ICT102 POO

## Description
Ce projet est une version améliorée du jeu **Puissance 4** réalisée en C++ en suivant les principes de la **Programmation Orientée Objet (POO)**.

## Fonctionnalités
- **Mode de jeu** : Joueur vs Joueur, Joueur vs IA (Basique), et IA vs IA.
- **Personnalisation** : Choix des noms et des symboles des joueurs.
- **Interface Visuelle** :
  - Affichage en couleur dans le terminal (Codes ANSI).
  - Mise en évidence de la ligne gagnante en vert.
  - Nettoyage automatique de l'écran pour une meilleure expérience.
- **Robustesse** : Gestion des entrées invalides et des colonnes pleines.
- **Rejouabilité** : Option pour recommencer une partie sans relancer le programme.

## Architecture
Le projet respecte une architecture POO stricte avec les classes suivantes :
- `Position` : Gère les coordonnées (x, y).
- `Pion` : Représente un jeton avec son symbole et sa position.
- `Grille` : Gère la grille de 6x7, le placement des pions et la détection de victoire.
- `Joueur` : Classe de base abstraite pour les joueurs.
    - `Humain` : Implémente le choix d'un coup par un utilisateur.
    - `IA` : Implémente un choix de coup aléatoire valide.
- `Puissance4` : Orchestre la partie et gère le menu.

## Compilation et Exécution
### Prérequis
- Un compilateur C++ supportant le standard C++11 (ex: `g++`).
- L'outil `make`.

### Instructions
1. Ouvrez un terminal dans le dossier du projet.
2. Compilez le projet avec la commande :
   ```bash
   make
   ```
3. Lancez le jeu :
   ```bash
   ./puissance4
   ```
4. Pour nettoyer les fichiers objets :
   ```bash
   make clean
   ```

## Auteur
Projet réalisé dans le cadre du cours **ICT102 - POO** (UY1 - ICT4D).
# puissance4
