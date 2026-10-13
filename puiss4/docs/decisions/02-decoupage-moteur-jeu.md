# Decision Record — DR-02 : Découpage architectural du moteur et isolation de la logique métier

**Date** : 7 septembre 2026  
**Phase concernée** : Phase 2 — Refactorisation du moteur du jeu  

## Problème actuel
Dans le code C++ d'origine, les règles du jeu, les flux d'entrées/sorties console (`std::cout`, `std::cin`) et la boucle d'événements synchrone sont entremêlés dans `Grille`, `JoueurHumain` et `Puissance4`. Cette imbrication empêche d'intégrer le moteur dans une interface graphique réactive ou mobile sans effets de bord.

## Cause
Le prototype initial a été conçu comme une application console directe en une seule boucle bloquante sans séparation en couches applicatives.

## Options envisagées

### Option 1 : Moteur modulaire en logique pure (Retenue)
- Découper le moteur en couches strictes sans aucune dépendance UI :
  1. `Board` / `Grille` : Matrice d'état pure, manipulation de jetons, gravité, détection d'alignements gagnants et coordonnées de la ligne gagnante.
  2. `Rules` : Validation des règles pures (coups valides, match nul, victoire).
  3. `GameState` : Snapshot immuable de l'état de la partie (pour réactivité UI, undo/redo).
  4. `Connect4AI` : Moteur de décision conservant les 3 niveaux d'heuristique (Facile, Moyen, Difficile).
  5. `GameController` : Orchestrateur exposant des commandes simples (`playColumn(col)`, `reset()`, `undo()`).
- **Avantages** : Testable à 100% de manière autonome, directement transposable en Dart sans modification de comportement.
- **Inconvénients** : Nécessite la création de structures de données claires pour les snapshots d'état.

### Option 2 : Conserver des callbacks de flux dans la boucle existante
- **Avantages** : Moins de fichiers créés.
- **Inconvénients** : Incompatible avec les paradigmes réactifs de Flutter (StateNotifier / ChangeNotifier / Streams).

## Recommandation
L'Option 1 est indispensable pour garantir une séparation stricte entre logique métier et interface mobile, comme prescrit par le guide d'architecture.

## Décision finale
Adoption de l'Option 1 avec double validation :
1. Découpage du moteur C++ dans `legacy_cpp/` avec exécution sans régression de la suite d'invariants (12/12).
2. Implémentation du moteur découplé équivalent en Dart dans `mobile_app/lib/` avec sa suite de tests dédiée.

## Conséquences
- Zéro import d'interface dans le moteur (`iostream` en C++, `material.dart` en Dart).
- Ajout de la détection précise des coordonnées des 4 pions gagnants pour permettre les animations de surbrillance en Phase 5.
- Support natif de l'annulation de coup (*Undo*).
