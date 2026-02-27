# Guide de Déploiement — Xamle Civic

## Architecture

- **Backend (API)** : VPS avec Docker
- **Frontend (Web)** : Vercel
- **Base de données** : PostgreSQL sur VPS
- **Cache** : Redis sur VPS
- **Recherche** : Meilisearch sur VPS
- **Stockage** : MinIO (S3) sur VPS

---

## 📋 Prérequis

### VPS
- Ubuntu 22.04 LTS ou supérieur
- 2 CPU / 4 GB RAM minimum (recommandé : 4 CPU / 8 GB)
- 50 GB de stockage SSD
- Accès root ou sudo
- Domaine configuré (ex: `api.xamle.sn`)

### Vercel
- Compte Vercel (gratuit ou Pro)
- Accès au repository GitHub/GitLab

### Outils locaux
- Docker & Docker Compose
- Git
- Node.js 20+

---

## 🚀 Déploiement Backend (VPS)

### 1. Préparation du VPS

```bash
# Connexion SSH
ssh root@votre-vps-ip

# Mise à jour du système
apt update && apt upgrade -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installation de Docker Compose
apt install docker-compose-plugin -y

# Vérification
docker --version
docker compose version

# Création d'un utilisateur non-root (optionnel mais recommandé)
adduser xamle
usermod -aG docker xamle
su - xamle
```

### 2. Configuration DNS

Configurez vos enregistrements DNS :

```
Type    Nom              Valeur          TTL
A       api.xamle.sn     VOTRE_VPS_IP    300
```

Attendez la propagation DNS (peut prendre jusqu'à 24h) :

```bash
# Vérifier la propagation
dig api.xamle.sn
```

### 3. Clone du Repository

```bash
cd ~
git clone https://github.com/votre-org/xamle-civic.git
cd xamle-civic
```

### 4. Configuration des Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp .env.production.example .env.production

# Éditer avec nano ou vim
nano .env.production
```

**Variables critiques à modifier** :

```bash
# Domaine
DOMAIN=api.xamle.sn
APP_URL=https://xamle.sn

# Base de données (générer des mots de passe forts)
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD

# JWT (générer avec: openssl rand -base64 32)
JWT_SECRET=CHANGE_ME_JWT_SECRET_MIN_32_CHARS
REFRESH_TOKEN_SECRET=CHANGE_ME_REFRESH_SECRET_MIN_32_CHARS

# Meilisearch (min 16 caractères)
MEILISEARCH_MASTER_KEY=CHANGE_ME_MEILISEARCH_KEY

# MinIO (générer des clés fortes)
MINIO_ACCESS_KEY=CHANGE_ME_MINIO_ACCESS
MINIO_SECRET_KEY=CHANGE_ME_MINIO_SECRET_KEY

# Email pour SSL
SSL_EMAIL=admin@xamle.sn

# CORS (domaines Vercel)
CORS_ORIGINS=https://xamle.sn,https://www.xamle.sn

# SMTP (optionnel, pour les emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@xamle.sn
SMTP_PASSWORD=CHANGE_ME_SMTP_PASSWORD
```

**Générer des secrets forts** :

```bash
# JWT Secret
openssl rand -base64 32

# Refresh Token Secret
openssl rand -base64 32

# Meilisearch Master Key
openssl rand -base64 24
```

### 5. Déploiement Initial

```bash
# Rendre le script exécutable
chmod +x scripts/deploy-vps.sh

# Lancer le déploiement
./scripts/deploy-vps.sh
```

Le script va :
1. ✅ Pull les images Docker
2. ✅ Build l'API
3. ✅ Démarrer PostgreSQL, Redis, Meilisearch, MinIO
4. ✅ Exécuter les migrations Prisma
5. ✅ (Optionnel) Seeder la base de données
6. ✅ Démarrer tous les services

### 6. Configuration SSL (Let's Encrypt)

**Important** : Avant de lancer ce script, assurez-vous que :
- Le DNS pointe vers votre VPS
- Le port 80 est ouvert
- Nginx est démarré

```bash
# Configuration SSL
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh
```

Le certificat sera automatiquement renouvelé tous les 12h.

### 7. Vérification

```bash
# Vérifier l'état des services
docker compose -f docker-compose.vps.yml ps

# Vérifier les logs
docker compose -f docker-compose.vps.yml logs -f api

# Tester l'API
curl https://api.xamle.sn/health
curl https://api.xamle.sn/api/v1/policies
```

**Réponse attendue** :

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-02-27T...",
    "services": {
      "database": "ok"
    }
  }
}
```

---

## 🌐 Déploiement Frontend (Vercel)

### 1. Préparation du Repository

Assurez-vous que votre code est poussé sur GitHub/GitLab.

### 2. Import sur Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"Add New Project"**
3. Importer votre repository
4. Sélectionner le framework : **Next.js**
5. Root Directory : `apps/web`

### 3. Configuration des Variables d'Environnement

Dans Vercel Dashboard → Settings → Environment Variables :

```bash
# Production
NEXT_PUBLIC_API_URL=https://api.xamle.sn
NEXT_PUBLIC_APP_URL=https://xamle.sn
NEXT_PUBLIC_MINIO_ENDPOINT=https://api.xamle.sn/storage

# Preview (optionnel)
NEXT_PUBLIC_API_URL=https://api-staging.xamle.sn
NEXT_PUBLIC_APP_URL=https://staging.xamle.sn
```

### 4. Configuration du Build

Dans Vercel Dashboard → Settings → General :

- **Framework Preset** : Next.js
- **Root Directory** : `apps/web`
- **Build Command** : `cd ../.. && pnpm install && pnpm --filter @xamle/web build`
- **Output Directory** : `.next`
- **Install Command** : `cd ../.. && pnpm install`

### 5. Domaine Personnalisé

Dans Vercel Dashboard → Settings → Domains :

1. Ajouter `xamle.sn`
2. Ajouter `www.xamle.sn`
3. Configurer les DNS selon les instructions Vercel

**Enregistrements DNS** :

```
Type    Nom              Valeur                  TTL
A       xamle.sn         76.76.21.21             300
CNAME   www.xamle.sn     cname.vercel-dns.com    300
```

### 6. Déploiement

```bash
# Push vers la branche main
git add .
git commit -m "Deploy to production"
git push origin main
```

Vercel va automatiquement :
1. ✅ Détecter le push
2. ✅ Build le projet
3. ✅ Déployer sur le CDN global
4. ✅ Activer HTTPS automatiquement

### 7. Vérification

Ouvrir https://xamle.sn et vérifier :
- ✅ Page d'accueil se charge
- ✅ Connexion à l'API fonctionne
- ✅ Login fonctionne
- ✅ Pas d'erreurs CORS

---

## 🔧 Configuration Post-Déploiement

### 1. Firewall (UFW)

```bash
# Activer le firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Vérifier
ufw status
```

### 2. Monitoring avec Uptime Kuma

Accéder à http://VOTRE_VPS_IP:3001

1. Créer un compte admin
2. Ajouter des monitors :
   - API Health : `https://api.xamle.sn/health`
   - Frontend : `https://xamle.sn`
   - PostgreSQL : `tcp://localhost:5432`
   - Redis : `tcp://localhost:6379`

### 3. Backups Automatiques

```bash
# Créer un script de backup
nano ~/backup-xamle.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/xamle/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec xamle-postgres pg_dump -U xamle_prod xamle_civic_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup MinIO
docker exec xamle-minio mc mirror local/xamle-documents $BACKUP_DIR/minio_$DATE/documents
docker exec xamle-minio mc mirror local/xamle-media $BACKUP_DIR/minio_$DATE/media

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "minio_*" -mtime +7 -exec rm -rf {} \;

echo "Backup completed: $DATE"
```

```bash
# Rendre exécutable
chmod +x ~/backup-xamle.sh

# Ajouter au cron (tous les jours à 2h du matin)
crontab -e
```

Ajouter :

```
0 2 * * * /home/xamle/backup-xamle.sh >> /home/xamle/backup.log 2>&1
```

### 4. Logs et Monitoring

```bash
# Voir les logs en temps réel
docker compose -f docker-compose.vps.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.vps.yml logs -f api

# Logs des 100 dernières lignes
docker compose -f docker-compose.vps.yml logs --tail=100

# Statistiques des conteneurs
docker stats
```

---

## 🔄 Mises à Jour

### Backend (VPS)

```bash
cd ~/xamle-civic

# Pull les dernières modifications
git pull origin main

# Rebuild et redéployer
./scripts/deploy-vps.sh
```

### Frontend (Vercel)

Les mises à jour sont automatiques sur chaque push vers `main`.

Pour forcer un redéploiement :

```bash
# Via CLI Vercel
vercel --prod

# Ou via dashboard Vercel → Deployments → Redeploy
```

---

## 🐛 Troubleshooting

### Backend ne démarre pas

```bash
# Vérifier les logs
docker compose -f docker-compose.vps.yml logs api

# Vérifier la base de données
docker compose -f docker-compose.vps.yml exec postgres psql -U xamle_prod -d xamle_civic_prod -c "\dt"

# Redémarrer un service
docker compose -f docker-compose.vps.yml restart api
```

### Erreurs CORS

Vérifier que `CORS_ORIGINS` dans `.env.production` contient bien l'URL Vercel :

```bash
CORS_ORIGINS=https://xamle.sn,https://www.xamle.sn
```

Redémarrer l'API après modification :

```bash
docker compose -f docker-compose.vps.yml restart api
```

### Certificat SSL expiré

```bash
# Renouveler manuellement
docker compose -f docker-compose.vps.yml run --rm certbot renew

# Redémarrer Nginx
docker compose -f docker-compose.vps.yml restart nginx
```

### Base de données corrompue

```bash
# Restaurer depuis un backup
gunzip < /home/xamle/backups/db_20260227_020000.sql.gz | \
  docker exec -i xamle-postgres psql -U xamle_prod -d xamle_civic_prod
```

### Espace disque plein

```bash
# Nettoyer les images Docker non utilisées
docker system prune -a

# Nettoyer les logs
docker compose -f docker-compose.vps.yml logs --tail=0

# Vérifier l'espace
df -h
```

---

## 📊 Commandes Utiles

### Docker

```bash
# Voir tous les conteneurs
docker ps -a

# Arrêter tous les services
docker compose -f docker-compose.vps.yml down

# Redémarrer tous les services
docker compose -f docker-compose.vps.yml restart

# Supprimer tous les volumes (⚠️ perte de données)
docker compose -f docker-compose.vps.yml down -v

# Accéder au shell d'un conteneur
docker exec -it xamle-api sh
docker exec -it xamle-postgres psql -U xamle_prod -d xamle_civic_prod
```

### Base de Données

```bash
# Connexion PostgreSQL
docker exec -it xamle-postgres psql -U xamle_prod -d xamle_civic_prod

# Lister les tables
\dt

# Voir les utilisateurs
SELECT email, role FROM "User";

# Exécuter une migration
docker compose -f docker-compose.vps.yml run --rm api npx prisma migrate deploy

# Seed
docker compose -f docker-compose.vps.yml run --rm api node dist/seed.js
```

### Nginx

```bash
# Tester la configuration
docker exec xamle-nginx nginx -t

# Recharger la configuration
docker exec xamle-nginx nginx -s reload

# Voir les logs d'accès
docker exec xamle-nginx tail -f /var/log/nginx/access.log

# Voir les logs d'erreur
docker exec xamle-nginx tail -f /var/log/nginx/error.log
```

---

## 🔐 Sécurité

### Checklist

- ✅ Mots de passe forts pour PostgreSQL, Redis, JWT
- ✅ Firewall activé (UFW)
- ✅ SSL/HTTPS configuré (Let's Encrypt)
- ✅ CORS correctement configuré
- ✅ Rate limiting activé (Nginx)
- ✅ Backups automatiques
- ✅ Monitoring actif (Uptime Kuma)
- ✅ Logs centralisés
- ✅ Utilisateur non-root pour Docker
- ✅ Secrets dans .env (pas dans le code)

### Recommandations

1. **Changer les mots de passe par défaut**
2. **Activer l'authentification 2FA** sur Vercel et VPS
3. **Configurer fail2ban** pour bloquer les attaques brute-force
4. **Mettre à jour régulièrement** Docker et les images
5. **Surveiller les logs** pour détecter les anomalies

---

## 📞 Support

- **Documentation** : [docs.xamle.sn](https://docs.xamle.sn)
- **Issues** : [github.com/votre-org/xamle-civic/issues](https://github.com/votre-org/xamle-civic/issues)
- **Email** : tech@xamle.sn
