# Decision Record — DR-04 : Architecture du multijoueur local entre deux appareils

**Date** : 7 septembre 2026  
**Phase concernée** : Phase 6 — Multijoueur local entre appareils  

## Problème actuel
Permettre à deux joueurs disposant chacun de leur smartphone de s'affronter sur une même partie de Puissance 4 sans passer par un serveur cloud tiers (pouvant fonctionner hors-ligne sur un même réseau Wi-Fi ou partage de connexion 4G/5G / Hotspot local).

## Analyse des technologies selon la grille comparative
1. **Bluetooth Low Energy / Bluetooth classique** :
   - Requiert des plugins natifs externes (`flutter_blue_plus`) qui demandent des permissions système complexes (localisation fine, autorisations Bluetooth différentes selon les versions d'Android 12/13/14). Fragile pour un premier déploiement sans réseau.
2. **Wi-Fi Direct (P2P Wi-Fi)** :
   - API Android bas niveau (`WifiP2pManager`) non standardisée sur iOS et dépendant fortement du constructeur matériel.
3. **Sockets TCP locaux avec architecture Hôte Local (Retenue)** :
   - Utilise `dart:io` (`ServerSocket` et `Socket`), inclus nativement dans le SDK Dart/Flutter (zéro dépendance externe).
   - Fonctionne sur n'importe quel réseau local (box domestique, Wi-Fi de campus ou simple partage de connexion / Hotspot sans accès Internet requis).
   - L'appareil hôte (Joueur 1) héberge le serveur sur un port dédié (`port: 8888`), et l'invité (Joueur 2) se connecte via l'adresse IP affichée à l'écran.
   - Échange de messages JSON légers : `{"type": "MOVE", "col": 3}`, `{"type": "STATE", ...}`, `{"type": "REMATCH"}`.
   - En cas de déconnexion réseau, un état propre `GameStatus.disconnected` est levé avec notification claire.

## Décision finale
Adoption des Sockets TCP locaux natifs Dart avec architecture Hôte Local.

## Conséquences
- Création de `mobile_app/lib/network/local_multiplayer.dart`.
- Zéro dépendance tierce ajoutée au `pubspec.yaml`.
- Le moteur `GameController` reste la source unique de vérité côté hôte et reçoit les coups réseau via sa méthode publique `playMove(col)`.
