#!/bin/bash

# ============================================================
# Script de Déploiement Backend sur VPS
# Usage: ./scripts/deploy-vps.sh
# ============================================================

set -e

echo "🚀 Démarrage du déploiement Backend sur VPS..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "docker-compose.vps.yml" ]; then
    echo -e "${RED}❌ Erreur: docker-compose.vps.yml non trouvé${NC}"
    echo "Assurez-vous d'être à la racine du projet"
    exit 1
fi

# Vérifier que .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erreur: .env.production non trouvé${NC}"
    echo "Copiez backend/.env.example vers .env.production et configurez-le"
    exit 1
fi

# Charger les variables d'environnement
export $(cat .env.production | grep -v '^#' | xargs)

echo -e "${YELLOW}📦 Récupération des dernières modifications...${NC}"
git pull origin main

echo -e "${YELLOW}🛑 Arrêt des services existants...${NC}"
docker compose -f docker-compose.vps.yml down

echo -e "${YELLOW}🔨 Build des images Docker...${NC}"
docker compose -f docker-compose.vps.yml build --no-cache api

echo -e "${YELLOW}🚀 Démarrage des services...${NC}"
docker compose -f docker-compose.vps.yml up -d

echo -e "${YELLOW}⏳ Attente du démarrage de l'API (30s)...${NC}"
sleep 30

echo -e "${YELLOW}🔍 Vérification de la santé de l'API...${NC}"
if curl -f -s "http://localhost:4000/health" > /dev/null; then
    echo -e "${GREEN}✅ API démarrée avec succès !${NC}"
else
    echo -e "${RED}❌ Erreur: L'API ne répond pas${NC}"
    echo "Vérifiez les logs avec: docker compose -f docker-compose.vps.yml logs api"
    exit 1
fi

echo -e "${YELLOW}📊 Statut des services:${NC}"
docker compose -f docker-compose.vps.yml ps

echo -e "${GREEN}✅ Déploiement terminé avec succès !${NC}"
echo ""
echo "📝 Commandes utiles:"
echo "  - Voir les logs: docker compose -f docker-compose.vps.yml logs -f"
echo "  - Redémarrer: docker compose -f docker-compose.vps.yml restart"
echo "  - Arrêter: docker compose -f docker-compose.vps.yml down"
echo ""
echo "🌐 URLs:"
echo "  - API Health: https://${DOMAIN}/health"
echo "  - API Docs: https://${DOMAIN}/api/docs"
