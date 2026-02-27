#!/bin/bash
set -e

# ============================================================
# Xamle Civic — SSL Setup Script (Let's Encrypt)
# ============================================================

echo "🔒 Configuration SSL avec Let's Encrypt"
echo "========================================"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Erreur: .env.production n'existe pas"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

if [ -z "$DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo "❌ Erreur: DOMAIN et SSL_EMAIL doivent être définis dans .env.production"
    exit 1
fi

echo "📋 Configuration:"
echo "  Domaine: $DOMAIN"
echo "  Email:   $SSL_EMAIL"
echo ""

# Check if certificates already exist
if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "⚠️  Les certificats SSL existent déjà pour $DOMAIN"
    read -p "Voulez-vous les renouveler ? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Annulé"
        exit 0
    fi
fi

echo "🚀 Étape 1: Démarrage de Nginx en mode HTTP uniquement"
# Temporarily use HTTP-only nginx config
docker compose -f docker-compose.vps.yml up -d nginx

echo ""
echo "📜 Étape 2: Obtention du certificat SSL"
docker compose -f docker-compose.vps.yml run --rm certbot \
    certonly --webroot \
    --webroot-path=/var/www/certbot \
    --email $SSL_EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificat SSL obtenu avec succès !"
    echo ""
    echo "🔄 Étape 3: Redémarrage de Nginx avec HTTPS"
    docker compose -f docker-compose.vps.yml restart nginx
    
    echo ""
    echo "✅ SSL configuré avec succès !"
    echo ""
    echo "🌐 Votre site est maintenant accessible via HTTPS:"
    echo "  https://$DOMAIN"
    echo ""
    echo "📝 Le certificat sera automatiquement renouvelé tous les 12h"
else
    echo ""
    echo "❌ Erreur lors de l'obtention du certificat SSL"
    echo ""
    echo "Vérifiez que:"
    echo "  1. Le domaine $DOMAIN pointe bien vers votre VPS"
    echo "  2. Le port 80 est ouvert et accessible"
    echo "  3. Nginx est démarré et fonctionne"
    exit 1
fi
