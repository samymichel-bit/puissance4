# Guide d'Exportation en Application Native Android (APK)

Ce projet est déjà configuré avec **Capacitor** pour être transformé en véritable application native Android installable (`.apk`) ou publiable sur le Google Play Store (`.aab`).

---

## 🚀 Étapes pour générer votre fichier APK :

### 1. Prérequis sur votre ordinateur
- [Node.js](https://nodejs.org) installé.
- [Android Studio](https://developer.android.com/studio) installé.

### 2. Commandes à lancer dans le dossier du projet :

```bash
# 1. Installer les outils natifs Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Compiler l'application web
npm run build

# 3. Créer le projet Android natif
npx cap add android

# 4. Ouvrir le projet directement dans Android Studio
npx cap open android
```

### 3. Générer le fichier APK dans Android Studio :
1. Dans Android Studio, cliquez dans le menu du haut sur : **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. Une fois la compilation terminée (environ 1 minute), Android Studio affiche une notification : cliquez sur **locate** pour récupérer directement votre fichier `app-debug.apk`.
3. Envoyez ce fichier `.apk` sur n'importe quel smartphone Android pour l'installer directement !
