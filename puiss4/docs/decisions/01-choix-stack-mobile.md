# Decision Record — DR-01 : Choix de la stack technologique cible pour le portage mobile

**Date** : 6 septembre 2026  
**Phase concernée** : Transition Phase 0 / Phase 1 vers Phase 2 & 4  

## Problème actuel
Le jeu de Puissance 4 existant est un prototype console en C++11 (`std::cout`, `std::cin`). Pour devenir une application mobile ergonomique, tactile et moderne ("un jeu mobile top"), le projet doit adopter une stack permettant de concevoir une interface réactive avec animations fluides (chute des jetons, surbrillance de victoire) et gestion tactile.

## Cause
Le C++ console ne fournit aucun composant d'interface utilisateur pour mobile. La logique métier doit être découplée puis portée ou reliée à une couche UI mobile.

## Options envisagées

### Option A — Flutter / Dart (Retenue)
- **Avantages** :
  - Framework réactif moderne avec un écosystème riche pour les jeux de plateau 2D légers.
  - Animations déclaratives de haute qualité (chute de jetons à 60/120 fps, transitions d'écrans).
  - Portabilité native Android & iOS avec une seule base de code.
  - Architecture en couches claire : logique pure en Dart testable unitairement sans dépendre du framework UI.
- **Inconvénients** :
  - Nécessite la transcription du moteur C++ vers Dart (ou utilisation de `dart:ffi`).
- **Complexité estimée** : Modérée.
- **Impact sur le reste du projet** : Port propre de la logique métier stabilisée en Dart, conservation stricte des algorithmes (gravité, alignements, IA à 3 niveaux).

### Option B — Android Natif (Kotlin / Jetpack Compose)
- **Avantages** : Intégration 100% Android native, possibilité de garder le code C++ via NDK/JNI.
- **Inconvénients** : Complexité du bridging JNI, développement limité à Android.
- **Complexité estimée** : Élevée (overhead NDK).

### Option C — C++ avec moteur 2D léger (SDL2 / Raylib)
- **Avantages** : Réutilisation directe du code C++.
- **Inconvénients** : Rendu graphique bas niveau, adaptation tactile et cycle de vie mobile complexes.
- **Complexité estimée** : Élevée pour une interface mobile soignée.

## Recommandation
L'Option A (Flutter / Dart) offre le meilleur ratio ergonomie / rapidité de développement / qualité visuelle pour un jeu mobile moderne.

## Décision finale
L'utilisateur a validé l'**Option A (Flutter / Dart)**.

## Conséquences
- Phase 1 : Couverture complète des invariants en C++ existant (filet de non-régression).
- Phase 2 : Modélisation et découplage de l'architecture cible du moteur (état immuable, règles pures, joueurs IA).
- Phase 4-5 : Implémentation Flutter de l'interface mobile, de la grille tactile et des animations.
