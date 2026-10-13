#!/usr/bin/env bash

# ==============================================================================
# Script d'automatisation complète : Git Pull -> Build Web -> Compilation APK
# Puissance 4 (Mobile Native Android)
# ==============================================================================

set -e

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║       PUISSANCE 4 - AUTOMATISATION DE BUILD APK NATIVE       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ------------------------------------------------------------------------------
# 1. Vérification de Git et Récupération des Dernières Modifications
# ------------------------------------------------------------------------------
echo -e "${BLUE}▶ [1/6] Récupération des dernières modifications GitHub (git pull)...${NC}"

if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    echo -e "   Branche actuelle détectée : ${CYAN}${CURRENT_BRANCH}${NC}"
    
    # Tentative de pull
    if git pull origin "${CURRENT_BRANCH}"; then
        echo -e "${GREEN}✔ Dépôt mis à jour avec succès.${NC}"
    else
        echo -e "${YELLOW}⚠ Avertissement : 'git pull origin ${CURRENT_BRANCH}' a échoué ou des conflits locaux existent.${NC}"
        echo -e "  Continuation avec les fichiers locaux existants..."
    fi
else
    echo -e "${YELLOW}⚠ Pas de dossier .git détecté dans le répertoire courant. Étape git pull ignorée.${NC}"
fi

# ------------------------------------------------------------------------------
# 2. Installation des dépendances NPM
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}▶ [2/6] Installation des dépendances Node.js...${NC}"
npm install

# Vérification et installation des outils natifs Capacitor si absents
if ! npm list @capacitor/core >/dev/null 2>&1 || ! npm list @capacitor/android >/dev/null 2>&1; then
    echo -e "${CYAN}   Installation des modules natifs Capacitor (@capacitor/core, @capacitor/android, @capacitor/cli)...${NC}"
    npm install @capacitor/core @capacitor/android @capacitor/cli --save
fi
echo -e "${GREEN}✔ Dépendances vérifiées et prêtes.${NC}"

# ------------------------------------------------------------------------------
# 3. Compilation du projet Web (Vite Build)
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}▶ [3/6] Compilation de l'application Web (npm run build)...${NC}"
npm run build
echo -e "${GREEN}✔ Dossier de production 'dist/' généré avec succès.${NC}"

# ------------------------------------------------------------------------------
# 4. Détection et configuration du SDK Android (ANDROID_HOME)
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}▶ [4/6] Détection de l'environnement Android SDK...${NC}"

if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
    # Chemins standards selon l'OS
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    elif [ -d "/c/Users/$USER/AppData/Local/Android/Sdk" ]; then
        export ANDROID_HOME="/c/Users/$USER/AppData/Local/Android/Sdk"
    elif [ -d "$LOCALAPPDATA/Android/Sdk" ]; then
        export ANDROID_HOME="$LOCALAPPDATA/Android/Sdk"
    fi
fi

if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✔ Android SDK localisé : ${ANDROID_HOME}${NC}"
else
    echo -e "${YELLOW}⚠ Variable ANDROID_HOME non définie par défaut.${NC}"
    echo -e "  Si la compilation Gradle échoue, définissez-la avec : export ANDROID_HOME=chemin/vers/votre/sdk"
fi

# ------------------------------------------------------------------------------
# 5. Synchronisation Capacitor avec la plateforme Android
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}▶ [5/6] Synchronisation du projet Android avec Capacitor...${NC}"

if [ ! -d "android" ]; then
    echo -e "   Plateforme Android absente. Initialisation avec 'npx cap add android'..."
    npx cap add android
fi

# Synchronisation des assets dist/ vers le projet Android
npx cap sync android
echo -e "${GREEN}✔ Plateforme Android synchronisée avec le build web.${NC}"

# ------------------------------------------------------------------------------
# 6. Compilation Gradle du fichier APK
# ------------------------------------------------------------------------------
echo ""
echo -e "${BLUE}▶ [6/6] Compilation de l'APK via Gradle Wrapper...${NC}"

cd android

# Rendre gradlew exécutable si nécessaire (Linux/macOS)
if [ -f "gradlew" ]; then
    chmod +x gradlew
    ./gradlew assembleDebug
else
    echo -e "${RED}✖ Erreur : gradlew est introuvable dans le dossier android.${NC}"
    exit 1
fi

cd ..

# ------------------------------------------------------------------------------
# 7. Finalisation et Copie de l'APK à la racine
# ------------------------------------------------------------------------------
APK_SOURCE="android/app/build/outputs/apk/debug/app-debug.apk"
APK_DEST="./puissance4-v1.apk"

if [ -f "$APK_SOURCE" ]; then
    cp "$APK_SOURCE" "$APK_DEST"
    APK_SIZE=$(du -h "$APK_DEST" | cut -f1)

    echo ""
    echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}${BOLD}🎉 SUCCÈS ! VOTRE FICHIER APK EST PRÊT !${NC}"
    echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════${NC}"
    echo -e "📍 Fichier généré à la racine : ${CYAN}${BOLD}${APK_DEST}${NC} (Taille: ${APK_SIZE})"
    echo ""
    echo -e "${BOLD}📲 Comment l'installer sur votre téléphone :${NC}"
    echo -e "  1. Copiez ${CYAN}${APK_DEST}${NC} sur votre smartphone (WhatsApp, Google Drive ou câble USB)."
    echo -e "  2. Cliquez sur le fichier sur votre smartphone pour lancer l'installation."
    echo ""
    echo -e "${BOLD}🚀 Ou installation directe par câble USB (si le mode Débogage USB est activé) :${NC}"
    echo -e "  ${YELLOW}adb install -r ${APK_DEST}${NC}"
    echo ""
else
    echo -e "${RED}✖ Erreur : L'APK n'a pas pu être localisé à ${APK_SOURCE}.${NC}"
    exit 1
fi

