# Decision Record — DR-06 : Intégration audio, thèmes multiples, icône et signature Play Store

**Date** : 7 septembre 2026  
**Phase concernée** : Phase 8+ — Finitions complètes, personnalisation et distribution  

## Problème actuel
Pour maximiser l'attractivité et l'expérience utilisateur mobile, le jeu doit proposer :
- Un retour sonore immersif en complément des retours haptiques.
- Des options de personnalisation esthétique (thèmes de plateau et de pions).
- Une identité visuelle claire avec une icône d'application dédiée.
- Une procédure standardisée pour la signature de release et le déploiement sur le Google Play Store.

## Solutions retenues
1. **Gestionnaire audio découplé (`SoundService`)** :
   - Lecture asynchrone des effets sonores (dépôt de jeton `drop.mp3`, victoire `win.mp3`, clic `click.mp3`).
   - Gestion robuste avec bascule douce (*fail-safe*) : si le son est désactivé ou indisponible, l'haptique assure la continuité du retour tactile sans aucune erreur applicative.
2. **Système de thèmes déclaratifs (`AppThemes`)** :
   - 4 ambiances intégrées : *Néon Sombre* (défaut), *Bois Rétro* (acajou et or), *Cyberpunk* (indigo et fuchsia), *Émeraude Royale* (vert profond et rubis).
   - Sélecteur interactif via `SettingsDialog`.
3. **Identité visuelle & Packaging de production** :
   - Icône générée en 512×512 sous `assets/icon/icon.png`.
   - Modèle de signature Android `key.properties.example` pour générer un Android App Bundle (`.aab`) prêt pour la console Google Play.
