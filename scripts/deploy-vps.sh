#!/bin/bash
set -e

# ============================================================
# Xamle Civic — VPS Deployment Script
# ============================================================

echo "🚀 Déploiement de Xamle Civic sur VPS"
echo "======================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Erreur: .env.production n'existe pas${NC}"
    echo "Copiez .env.production.example vers .env.production et remplissez les valeurs"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

echo "📦 Étape 1: Pull des dernières images Docker"
docker compose -f docker-compose.vps.yml pull

echo ""
echo "🔨 Étape 2: Build de l'API"
docker compose -f docker-compose.vps.yml build api

echo ""
echo "🗄️  Étape 3: Démarrage de la base de données"
docker compose -f docker-compose.vps.yml up -d postgres redis meilisearch minio

echo ""
echo "⏳ Attente de la disponibilité des services..."
sleep 10

echo ""
echo "🔄 Étape 4: Migrations de la base de données"
docker compose -f docker-compose.vps.yml run --rm api sh -c "npx prisma migrate deploy"

echo ""
echo "🌱 Étape 5: Seed de la base de données (optionnel)"
read -p "Voulez-vous seeder la base de données ? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose -f docker-compose.vps.yml run --rm api sh -c "node dist/seed.js"
fi

echo ""
echo "🚀 Étape 6: Démarrage de tous les services"
docker compose -f docker-compose.vps.yml up -d

echo ""
echo "🔍 Étape 7: Vérification de l'état des services"
sleep 5
docker compose -f docker-compose.vps.yml ps

echo ""
echo "📊 Étape 8: Logs des services"
docker compose -f docker-compose.vps.yml logs --tail=50

echo ""
echo -e "${GREEN}✅ Déploiement terminé !${NC}"
echo ""
echo "🌐 Services disponibles:"
echo "  - API:          https://${DOMAIN}/api/v1"
echo "  - Swagger:      https://${DOMAIN}/api/docs"
echo "  - Health:       https://${DOMAIN}/health"
echo "  - MinIO Console: https://${DOMAIN}/minio-console"
echo "  - Monitoring:   http://localhost:3001"
echo ""
echo "📝 Commandes utiles:"
echo "  - Voir les logs:        docker compose -f docker-compose.vps.yml logs -f"
echo "  - Redémarrer:           docker compose -f docker-compose.vps.yml restart"
echo "  - Arrêter:              docker compose -f docker-compose.vps.yml down"
echo "  - Mise à jour:          ./scripts/deploy-vps.sh"
echo ""
