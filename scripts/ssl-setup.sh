#!/bin/bash

# ============================================================
# Script d'Obtention du Certificat SSL Let's Encrypt
# Usage: ./scripts/ssl-setup.sh
# ============================================================

set -e

echo "🔒 Configuration SSL Let's Encrypt..."

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier que .env.production existe
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ Erreur: .env.production non trouvé${NC}"
    exit 1
fi

# Charger les variables d'environnement
export $(cat .env.production | grep -v '^#' | xargs)

# Vérifier que les variables nécessaires sont définies
if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}❌ Erreur: DOMAIN et SSL_EMAIL doivent être définis dans .env.production${NC}"
    exit 1
fi

echo -e "${YELLOW}📝 Configuration:${NC}"
echo "  Domaine: $DOMAIN"
echo "  Email: $SSL_EMAIL"
echo ""

read -p "Continuer ? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo -e "${YELLOW}🚀 Démarrage de Nginx en mode HTTP...${NC}"
docker compose -f docker-compose.vps.yml up -d nginx

echo -e "${YELLOW}⏳ Attente du démarrage de Nginx (10s)...${NC}"
sleep 10

echo -e "${YELLOW}🔐 Obtention du certificat SSL...${NC}"
docker compose -f docker-compose.vps.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email "$SSL_EMAIL" \
  --agree-tos \
  --no-eff-email \
  --force-renewal \
  -d "$DOMAIN"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Certificat SSL obtenu avec succès !${NC}"
    
    echo -e "${YELLOW}🔄 Redémarrage de Nginx avec SSL...${NC}"
    docker compose -f docker-compose.vps.yml restart nginx
    
    echo -e "${YELLOW}🔍 Test du certificat...${NC}"
    sleep 5
    
    if curl -f -s "https://$DOMAIN/health" > /dev/null; then
        echo -e "${GREEN}✅ SSL configuré correctement !${NC}"
        echo ""
        echo "🌐 Votre API est maintenant accessible sur: https://$DOMAIN"
    else
        echo -e "${YELLOW}⚠️  SSL configuré mais l'API ne répond pas encore${NC}"
        echo "Vérifiez les logs: docker compose -f docker-compose.vps.yml logs nginx"
    fi
else
    echo -e "${RED}❌ Erreur lors de l'obtention du certificat${NC}"
    echo "Vérifiez que:"
    echo "  1. Le domaine $DOMAIN pointe vers ce serveur"
    echo "  2. Les ports 80 et 443 sont ouverts"
    echo "  3. Nginx est démarré"
    exit 1
fi

echo ""
echo "📝 Le certificat sera renouvelé automatiquement tous les 12h"
echo "   Pour tester le renouvellement: docker compose -f docker-compose.vps.yml exec certbot certbot renew --dry-run"
