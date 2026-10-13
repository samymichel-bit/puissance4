#!/usr/bin/env bash
# ==============================================================================
# Script d'automatisation complète : Puissance 4 Mobile (Flutter / C++)
# Auteur : Spark / HackSam
# Environnement cible : Linux (Debian, Ubuntu, Parrot OS, Fedora, etc.)
# ==============================================================================

set -Eeo pipefail

# --- Couleurs & Typographie pour affichage clair ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Gestionnaire global d'exceptions (Trap ERR) ---
trap 'handle_exception $? $LINENO' ERR

handle_exception() {
    local exit_code=$1
    local line_num=$2
    echo -e "\n${RED}${BOLD}[ERREUR FATALE]${NC} Une exception est survenue à la ligne ${line_num} (code de sortie: ${exit_code})."
    echo -e "${YELLOW}Vérifiez le message ci-dessus pour identifier la cause (connexion, dépendance ou permissions).${NC}"
    exit "${exit_code}"
}

log_info() {
    echo -e "${BLUE}${BOLD}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}${BOLD}[SUCCÈS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}${BOLD}[ATTENTION]${NC} $1"
}

log_step() {
    echo -e "\n${CYAN}${BOLD}===> $1 <===${NC}"
}

echo -e "${BOLD}====================================================================${NC}"
echo -e "${BOLD}   AUTOMATISATION COMPLÈTE DU PROJET PUISSANCE 4 (FLUTTER / C++)   ${NC}"
echo -e "${BOLD}====================================================================${NC}"

# ------------------------------------------------------------------------------
# 1. VÉRIFICATION DE L'ENVIRONNEMENT ET DES PRÉREQUIS SYSTÈME
# ------------------------------------------------------------------------------
log_step "1. Vérification des outils requis"

MISSING_TOOLS=()

for tool in git curl unzip make g++; do
    if command -v "$tool" >/dev/null 2>&1; then
        echo -e "  [✓] $tool : $(which "$tool")"
    else
        echo -e "  [✗] $tool : MANQUANT"
        MISSING_TOOLS+=("$tool")
    fi
done

if [ ${#MISSING_TOOLS[@]} -gt 0 ]; then
    log_warning "Certains outils système sont manquants : ${MISSING_TOOLS[*]}"
    if command -v apt-get >/dev/null 2>&1; then
        echo -e "${YELLOW}Tentative d'installation automatique via apt... (sudo requis)${NC}"
        sudo apt-get update && sudo apt-get install -y "${MISSING_TOOLS[@]}" || {
            log_warning "Impossible d'installer automatiquement. Veuillez exécuter : sudo apt-get install -y ${MISSING_TOOLS[*]}"
        }
    else
        echo -e "${RED}Veuillez installer manuellement les paquets suivants : ${MISSING_TOOLS[*]}${NC}"
        exit 1
    fi
fi

# Vérification de Flutter
if command -v flutter >/dev/null 2>&1; then
    FLUTTER_VERSION=$(flutter --version | head -n 1)
    echo -e "  [✓] flutter : ${FLUTTER_VERSION}"
else
    echo -e "${RED}[✗] Flutter n'est pas détecté dans votre PATH.${NC}"
    echo -e "Pour installer Flutter sur Linux :"
    echo -e "  1. Téléchargez Flutter : https://docs.flutter.dev/get-started/install/linux"
    echo -e "  2. Extrayez l'archive dans ~/development/flutter"
    echo -e "  3. Ajoutez Flutter à votre PATH dans ~/.bashrc :"
    echo -e '     export PATH="$PATH:$HOME/development/flutter/bin"'
    echo -e "  4. Rechargez votre terminal : source ~/.bashrc"
    exit 1
fi

# ------------------------------------------------------------------------------
# 2. LOCALISATION OU TÉLÉCHARGEMENT DU PROJET
# ------------------------------------------------------------------------------
log_step "2. Préparation du répertoire de travail"

REPO_URL="https://github.com/samymichel-bit/puissance4.git"
TARGET_DIR="puissance4"

if [ -d ".git" ] && [ -d "mobile_app" ]; then
    log_info "Script exécuté directement à l'intérieur du projet."
    PROJECT_ROOT="$(pwd)"
elif [ -d "$TARGET_DIR" ] && [ -d "$TARGET_DIR/mobile_app" ]; then
    log_info "Dossier $TARGET_DIR déjà présent."
    PROJECT_ROOT="$(pwd)/$TARGET_DIR"
    cd "$PROJECT_ROOT"
else
    log_info "Clonage du dépôt $REPO_URL..."
    if [ ! -d "$TARGET_DIR" ]; then
        git clone "$REPO_URL" "$TARGET_DIR" || {
            echo -e "${RED}Échec du clonage Git. Vérifiez votre connexion Internet.${NC}"
            exit 1
        }
    fi
    PROJECT_ROOT="$(pwd)/$TARGET_DIR"
    cd "$PROJECT_ROOT"
fi

# ------------------------------------------------------------------------------
# 3. VÉRIFICATION / EXTRACTION DE L'ARCHIVE MOBILE SI NÉCESSAIRE
# ------------------------------------------------------------------------------
log_step "3. Vérification de la présence de l'application mobile"

if [ ! -d "mobile_app" ]; then
    log_warning "Le dossier 'mobile_app' n'est pas encore présent dans le dépôt cloné."
    if [ -f "../puissance4_mobile_complet.zip" ]; then
        log_info "Archive '../puissance4_mobile_complet.zip' détectée. Extraction en cours..."
        unzip -o "../puissance4_mobile_complet.zip" -d .
        log_success "Fichiers extraits avec succès."
    elif [ -f "puissance4_mobile_complet.zip" ]; then
        log_info "Archive 'puissance4_mobile_complet.zip' détectée. Extraction en cours..."
        unzip -o "puissance4_mobile_complet.zip" -d .
        log_success "Fichiers extraits avec succès."
    else
        echo -e "${YELLOW}Veuillez placer 'puissance4_mobile_complet.zip' dans ce dossier ou le télécharger depuis Google Drive :${NC}"
        echo -e "${BLUE}https://drive.google.com/file/d/1BpQjUnDB0VmvLGvFW3TIA_r1itSaIAgj/view?usp=drivesdk${NC}"
        read -p "Appuyez sur [Entrée] une fois l'archive placée ici..."
        if [ -f "puissance4_mobile_complet.zip" ]; then
            unzip -o "puissance4_mobile_complet.zip" -d .
        else
            echo -e "${RED}Archive introuvable. Arrêt du script.${NC}"
            exit 1
        fi
    fi
fi

# ------------------------------------------------------------------------------
# 4. EXÉCUTION DES TESTS DE NON-RÉGRESSION DU CŒUR C++
# ------------------------------------------------------------------------------
log_step "4. Tests de non-régression du moteur C++ (Invariants)"

if [ -d "legacy_cpp" ]; then
    log_info "Compilation et validation des 12 invariants fondamentaux..."
    make -C legacy_cpp test || {
        echo -e "${RED}Échec des tests C++. Une régression a été détectée dans le moteur.${NC}"
        exit 1
    }
    log_success "Tous les tests C++ sont validés (12/12 invariants vérifiés)."
else
    log_warning "Répertoire legacy_cpp non trouvé, étape passée."
fi

# ------------------------------------------------------------------------------
# 5. CONFIGURATION ET TESTS DE L'APPLICATION FLUTTER
# ------------------------------------------------------------------------------
log_step "5. Installation des dépendances et tests Flutter"

cd "$PROJECT_ROOT/mobile_app"

log_info "Exécution de 'flutter pub get'..."
flutter pub get || {
    echo -e "${RED}Erreur lors du téléchargement des dépendances Flutter.${NC}"
    exit 1
}
log_success "Dépendances Flutter installées avec succès."

log_info "Génération des icônes d'application (flutter_launcher_icons)..."
dart run flutter_launcher_icons || log_warning "Génération d'icônes ignorée (asset manquant ou déjà à jour)."

log_info "Exécution de la suite de tests unitaires Flutter..."
flutter test || {
    echo -e "${RED}Certains tests Flutter ont échoué.${NC}"
    exit 1
}
log_success "Tests unitaires Flutter validés à 100%."

# ------------------------------------------------------------------------------
# 6. DÉTECTION DES APPAREILS CONNECTÉS ET CHOIX DU LANCEMENT
# ------------------------------------------------------------------------------
log_step "6. Options de lancement et compilation"

echo -e "Recherche d'appareils connectés (USB / Wi-Fi / Émulateurs)..."
flutter devices || true

echo -e "\n${BOLD}Que souhaitez-vous faire ?${NC}"
echo -e "  ${GREEN}1)${NC} Lancer le jeu immédiatement sur l'appareil connecté (${CYAN}flutter run${NC})"
echo -e "  ${GREEN}2)${NC} Compiler l'APK Android autonome de production (${CYAN}flutter build apk --release${NC})"
echo -e "  ${GREEN}3)${NC} Compiler le bundle Android pour le Google Play Store (${CYAN}flutter build appbundle${NC})"
echo -e "  ${GREEN}4)${NC} Quitter"
read -r -p "Votre choix (1/2/3/4) [défaut: 1] : " USER_CHOICE
USER_CHOICE=${USER_CHOICE:-1}

case "$USER_CHOICE" in
    1)
        log_info "Démarrage du jeu en direct..."
        flutter run
        ;;
    2)
        log_info "Compilation de l'APK Release en cours..."
        flutter build apk --release
        log_success "APK compilé avec succès !"
        echo -e "${GREEN}${BOLD}Emplacement du fichier :${NC} $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
        ;;
    3)
        log_info "Compilation du bundle de release pour le Play Store..."
        flutter build appbundle --release
        log_success "Bundle compilé avec succès !"
        echo -e "${GREEN}${BOLD}Emplacement du fichier :${NC} $(pwd)/build/app/outputs/bundle/release/app-release.aab"
        ;;
    4)
        log_info "Opérations terminées. Bonne partie !"
        ;;
    *)
        log_warning "Option invalide. Fin du script."
        ;;
esac
