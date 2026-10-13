# Decision Record — DR-05 : Persistance des statistiques, optimisations et packaging de release

**Date** : 7 septembre 2026  
**Phase concernée** : Phase 7 & 8 — Persistance, optimisation et distribution  

## Problème actuel
Pour offrir une expérience de jeu mobile complète et pérenne ("un jeu mobile top"), le joueur doit pouvoir :
- Suivre ses statistiques (victoires, défaites contre chaque niveau d'IA, série de victoires en cours et record).
- Disposer d'une application réactive à 60 fps / 120 fps sans latence perceptible.
- Compiler et générer un package installable autonome (`.apk` pour Android).

## Solutions retenues
1. **Dépôt de statistiques découplé (`StatsRepository`)** :
   - Sauvegarde sérialisée en JSON sans dépendance externe lourde.
   - Dialogue visuel `StatsDialog` intégré avec calcul automatique du taux de victoire.
2. **Performances & UI déclarative** :
   - Grille vectorielle fluide sans textures bitmaps lourdes.
   - Animations déclaratives avec `TweenAnimationBuilder` et `Curves.bounceOut` pour la physique de chute des jetons.
3. **Packaging et instructions de build** :
   - Configuration Gradle et Flutter pour la génération de l'APK de release (`flutter build apk --release`).
