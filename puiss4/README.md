# Puissance 4 — Du Prototype C++ vers l'Application Mobile Flutter

Projet de **Puissance 4** modernisé à partir du prototype scolaire initial en C++11 ([samymichel-bit/puissance4](https://github.com/samymichel-bit/puissance4)), transformé en une application mobile tactile, animée et performante sous **Flutter / Dart** selon une méthodologie rigoureuse de non-régression en 8 phases.

---

## 📱 Fonctionnalités de la Version Mobile

1. **Expérience Tactile & Responsive** :
   - Cibles tactiles étendues sur toute la colonne pour un jeu au doigt sans friction.
   - Respect strict du ratio officiel $7:6$ sur tous les téléphones et tablettes (portrait/paysage).
2. **Animations & Immersion** :
   - Chute réaliste des jetons avec gravité et rebond dynamique (`Curves.bounceOut`).
   - Détection et pulsation lumineuse émeraude sur les 4 jetons formant l'alignement victorieux.
   - Retours haptiques légers lors de la pose des jetons et de la victoire.
3. **Modes de Jeu Complets** :
   - **Joueur vs Joueur (Local)** : Deux joueurs sur le même écran avec bandeau de tour interactif.
   - **Joueur vs IA (3 Niveaux)** :
     - *Facile* : Coups aléatoires.
     - *Moyen* : Détection de victoire directe et blocage immédiat de l'adversaire.
     - *Difficile* : Évaluation heuristique pondérée de position (colonnes centrales, alignements de 2 et 3).
   - **Démonstration IA vs IA** : Match automatique pour observer les stratégies.
   - **Multijoueur Réseau Local (Wi-Fi / Hotspot)** : Affrontement entre deux téléphones sur le même réseau via sockets TCP légers (`LocalMultiplayerService`).
4. **Outils & Confort** :
   - Annulation de coup (*Undo*) adaptée au mode solo (annule 2 coups pour redonner la main).
   - Suivi complet des statistiques (parties jouées, victoires, ratio, série de victoires en cours et record).

---

## 🏗️ Architecture du Projet

```text
samymichel-bit/puissance4/
├── legacy_cpp/                # Code source C++ d'origine stabilisé & moteur découplé
│   ├── Makefile               # Build C++11 (make, make test, make clean)
│   ├── main.cpp               # Point d'entrée console
│   ├── grille.h/.cpp          # Grille originale
│   ├── joueur.h/.cpp          # Hiérarchie originale de joueurs
│   ├── test_invariants.cpp    # Banc de tests des 12 invariants fondamentaux (12/12 OK)
│   └── engine/                # Moteur C++ découplé sans aucune dépendance console
│       ├── board.h/.cpp       # Matrice pure et capture des coordonnées gagnantes
│       ├── ai.h/.cpp          # IA sans iostream
│       └── game_controller.h/.cpp # Orchestrateur avec support de l'Undo
├── mobile_app/                # Application mobile Flutter / Dart
│   ├── pubspec.yaml           # Dépendances et configuration
│   ├── lib/
│   │   ├── main.dart          # Point d'entrée Flutter
│   │   ├── engine/            # Logique métier pure (zéro import UI)
│   │   │   ├── cell.dart      # CellState & BoardCoord
│   │   │   └── board.dart     # Plateau 6x7 immuable/clonable
│   │   ├── ai/
│   │   │   └── connect4_ai.dart # Transcription exacte des 3 niveaux d'IA
│   │   ├── controller/
│   │   │   └── game_controller.dart # Contrôleur réactif et historique de coups
│   │   ├── network/
│   │   │   └── local_multiplayer.dart # Sockets TCP locaux (Hôte / Client)
│   │   ├── persistence/
│   │   │   └── stats_repository.dart # Sauvegarde des statistiques en JSON
│   │   └── ui/
│   │       ├── theme/app_theme.dart       # Palette sombre néon
│   │       ├── widgets/board_widget.dart  # Grille tactile interactive
│   │       ├── widgets/disc_widget.dart   # Jeton 3D avec halo lumineux
│   │       ├── widgets/player_card.dart   # Indicateur de joueur actif et scores
│   │       ├── widgets/game_controls.dart # Boutons Annuler, Rejouer, Options
│   │       ├── screens/game_screen.dart   # Écran de jeu principal
│   │       ├── screens/game_over_dialog.dart # Modale de fin de partie
│   │       └── screens/stats_dialog.dart     # Tableau de bord des statistiques
│   └── test/
│       └── engine_invariants_test.dart # Tests unitaires des invariants en Dart
└── docs/decisions/            # Historique des décisions architecturales
    ├── 01-choix-stack-mobile.md
    ├── 02-decoupage-moteur-jeu.md
    ├── 03-interface-mobile-flutter.md
    ├── 04-multijoueur-reseau-local.md
    └── 05-stats-et-packaging.md
```

---

## 🚀 Guide d'Exécution

### 1. Prototype Console C++ (Original & Tests de non-régression)

```bash
cd legacy_cpp

# Compiler et lancer le jeu console :
make
./puissance4

# Lancer la suite de tests des 12 invariants :
make test
```

### 2. Application Mobile Flutter

```bash
cd mobile_app

# Installer les dépendances :
flutter pub get

# Lancer la suite de tests unitaires :
flutter test

# Exécuter sur simulateur ou appareil connecté :
flutter run

# Générer l'APK de production pour Android :
flutter build apk --release
```

L'APK prêt à installer sera disponible sous `build/app/outputs/flutter-apk/app-release.apk`.

---

## 🛡️ Invariants du Puissance 4 Garantis

Toutes les modifications respectent strictement les invariants fondamentaux :
- **État initial vide** : 6 lignes × 7 colonnes, cases libres.
- **Gravité réelle** : Les pions s'empilent du bas vers le haut.
- **Rejet des coups invalides** : Colonnes pleines et hors-bornes protégées.
- **Alternance stricte** : Passage de tour uniquement sur coup légal.
- **4 Types d'alignements gagnants** : Horizontale, Verticale, Diagonale montante (`/`), Diagonale descendante (`\`).
- **Match nul & cas limites** : Détection propre du nul à 42 coups et priorité à la victoire sur le dernier coup possible.
