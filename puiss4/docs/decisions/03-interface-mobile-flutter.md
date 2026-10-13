# Decision Record — DR-03 : Architecture de l'interface mobile Flutter tactile et responsive

**Date** : 7 septembre 2026  
**Phase concernée** : Phase 3 & 4 — Interface et ergonomie mobile  

## Problème actuel
Le jeu nécessite une interface visuelle interactive pour smartphones et tablettes, respectant les contraintes d'ergonomie mobile :
- Cibles tactiles larges pour les doigts (colonnes entières cliquables).
- Respect du ratio de plateau $7:6$ sur tous les formats d'écran (portrait/paysage).
- Retour visuel immédiat du tour en cours et surbrillance des alignements gagnants.

## Cause
L'ancien affichage ASCII ne peut pas être transposé directement en mobile sans une interface graphique native adaptée aux gestes tactiles.

## Options envisagées
1. **Grille responsive déclarative avec `LayoutBuilder` et `AspectRatio` (Retenue)** :
   - Calcule dynamiquement le diamètre optimal des cases en fonction de la taille disponible.
   - Utilise des colonnes tactiles invisibles avec détection `HitTestBehavior.opaque` pour que le joueur puisse taper n'importe où dans la colonne pour lâcher son pion.
   - Pions stylisés avec dégradés radiaux 3D et bordures douces.
   - Surbrillance lumineuse dynamique sur les 4 coordonnées gagnantes (`winningCoords`) fournies par le moteur.
2. **Plateau à taille fixe avec défilement (`SingleChildScrollView`)** :
   - Rejeté : Dégrade l'expérience sur petits écrans et empêche d'avoir la grille complète visible d'un seul coup d'œil.

## Décision finale
Adoption de la solution 1 (Grille responsive avec calcul dynamique des cases).

## Conséquences
- Code modulaire séparé dans `mobile_app/lib/ui/` (`widgets/`, `screens/`, `theme/`).
- Prise en charge des 3 modes : PvP 2 joueurs sur le même appareil, PvE contre l'IA avec délai visuel de réflexion (450ms pour le naturel), et Démonstration IA vs IA.
