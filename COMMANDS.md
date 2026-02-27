# Commandes Utiles — Xamle Civic

## 🚀 Déploiement

### VPS (Backend)

```bash
# Déploiement initial
./scripts/deploy-vps.sh

# Configuration SSL
./scripts/setup-ssl.sh

# Mise à jour
git pull origin main
./scripts/deploy-vps.sh
```

### Vercel (Frontend)

```bash
# Déploiement automatique
git push origin main

# Déploiement manuel via CLI
vercel --prod

# Preview deployment
vercel
```

---

## 🐳 Docker

### Gestion des Services

```bash
# Démarrer tous les services
docker compose -f docker-compose.vps.yml up -d

# Arrêter tous les services
docker compose -f docker-compose.vps.yml down

# Redémarrer tous les services
docker compose -f docker-compose.vps.yml restart

# Redémarrer un service spécifique
docker compose -f docker-compose.vps.yml restart api

# Voir l'état des services
docker compose -f docker-compose.vps.yml ps

# Voir les stats en temps réel
docker stats
```

### Logs

```bash
# Logs de tous les services
docker compose -f docker-compose.vps.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.vps.yml logs -f api
docker compose -f docker-compose.vps.yml logs -f postgres
docker compose -f docker-compose.vps.yml logs -f nginx

# Logs des 100 dernières lignes
docker compose -f docker-compose.vps.yml logs --tail=100

# Logs depuis une date
docker compose -f docker-compose.vps.yml logs --since 2h
```

### Nettoyage

```bash
# Nettoyer les images non utilisées
docker system prune -a

# Nettoyer les volumes non utilisés
docker volume prune

# Nettoyer tout (⚠️ supprime les données)
docker compose -f docker-compose.vps.yml down -v
```

---

## 🗄️ Base de Données

### Connexion PostgreSQL

```bash
# Via Docker
docker exec -it xamle-postgres psql -U xamle_prod -d xamle_civic_prod

# Commandes SQL utiles
\dt                          # Lister les tables
\d "User"                    # Décrire la table User
\q                           # Quitter
```

### Migrations Prisma

```bash
# Appliquer les migrations
docker compose -f docker-compose.vps.yml run --rm api npx prisma migrate deploy

# Créer une nouvelle migration (en dev)
cd apps/api
npx prisma migrate dev --name nom_de_la_migration

# Reset de la base (⚠️ supprime toutes les données)
docker compose -f docker-compose.vps.yml run --rm api npx prisma migrate reset

# Générer le client Prisma
docker compose -f docker-compose.vps.yml run --rm api npx prisma generate
```

### Seed

```bash
# Seed de la base de données
docker compose -f docker-compose.vps.yml run --rm api node dist/seed.js

# Seed en dev
cd apps/api
pnpm run db:seed
```

### Backup & Restore

```bash
# Backup
docker exec xamle-postgres pg_dump -U xamle_prod xamle_civic_prod | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup_20260227.sql.gz | docker exec -i xamle-postgres psql -U xamle_prod -d xamle_civic_prod

# Backup automatique (cron)
0 2 * * * docker exec xamle-postgres pg_dump -U xamle_prod xamle_civic_prod | gzip > /home/xamle/backups/db_$(date +\%Y\%m\%d_\%H\%M\%S).sql.gz
```

### Requêtes Utiles

```sql
-- Voir tous les utilisateurs
SELECT email, role, "isActive", "lastLoginAt" FROM "User";

-- Compter les politiques par statut
SELECT status, COUNT(*) FROM "Policy" GROUP BY status;

-- Voir les dernières contributions
SELECT * FROM "Contribution" ORDER BY "createdAt" DESC LIMIT 10;

-- Voir les logs d'audit
SELECT * FROM "AuditLog" ORDER BY "createdAt" DESC LIMIT 20;
```

---

## 🔴 Redis

### Connexion

```bash
# Via Docker
docker exec -it xamle-redis redis-cli -a ${REDIS_PASSWORD}

# Commandes Redis utiles
PING                         # Test connexion
KEYS *                       # Lister toutes les clés
GET policy:slug              # Récupérer une valeur
DEL policy:slug              # Supprimer une clé
FLUSHALL                     # Vider tout le cache (⚠️)
INFO                         # Statistiques Redis
```

---

## 🔍 Meilisearch

### Connexion

```bash
# Via curl
curl -H "Authorization: Bearer ${MEILISEARCH_MASTER_KEY}" \
  http://localhost:7700/health

# Lister les index
curl -H "Authorization: Bearer ${MEILISEARCH_MASTER_KEY}" \
  http://localhost:7700/indexes

# Rechercher
curl -H "Authorization: Bearer ${MEILISEARCH_MASTER_KEY}" \
  -X POST http://localhost:7700/indexes/policies/search \
  -d '{"q": "agriculture"}'
```

### Réindexation

```bash
# Via l'API
curl -X POST https://api.xamle.sn/api/v1/search/reindex \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📦 MinIO (S3)

### Connexion

```bash
# Via mc (MinIO Client)
docker exec -it xamle-minio mc alias set local http://localhost:9000 ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}

# Lister les buckets
docker exec -it xamle-minio mc ls local/

# Lister les fichiers
docker exec -it xamle-minio mc ls local/xamle-documents/
docker exec -it xamle-minio mc ls local/xamle-media/

# Copier un fichier
docker exec -it xamle-minio mc cp local/xamle-documents/file.pdf ./

# Backup d'un bucket
docker exec -it xamle-minio mc mirror local/xamle-documents ./backup/documents/
```

---

## 🌐 Nginx

### Gestion

```bash
# Tester la configuration
docker exec xamle-nginx nginx -t

# Recharger la configuration
docker exec xamle-nginx nginx -s reload

# Redémarrer Nginx
docker compose -f docker-compose.vps.yml restart nginx
```

### Logs

```bash
# Logs d'accès
docker exec xamle-nginx tail -f /var/log/nginx/access.log

# Logs d'erreur
docker exec xamle-nginx tail -f /var/log/nginx/error.log

# Filtrer les erreurs 5xx
docker exec xamle-nginx grep " 5[0-9][0-9] " /var/log/nginx/access.log
```

---

## 🔒 SSL (Let's Encrypt)

### Gestion des Certificats

```bash
# Renouveler manuellement
docker compose -f docker-compose.vps.yml run --rm certbot renew

# Vérifier l'expiration
docker compose -f docker-compose.vps.yml run --rm certbot certificates

# Obtenir un nouveau certificat
docker compose -f docker-compose.vps.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  --email admin@xamle.sn --agree-tos --no-eff-email \
  -d api.xamle.sn
```

---

## 📊 Monitoring

### Uptime Kuma

```bash
# Accéder à l'interface
open http://VPS_IP:3001
```

### Logs Système

```bash
# Logs Docker
journalctl -u docker -f

# Espace disque
df -h

# Mémoire
free -h

# CPU
top
htop

# Processus Docker
docker ps
docker stats
```

---

## 🔥 Urgences

### API ne répond pas

```bash
# 1. Vérifier les logs
docker compose -f docker-compose.vps.yml logs -f api

# 2. Vérifier la base de données
docker compose -f docker-compose.vps.yml exec postgres pg_isready

# 3. Redémarrer l'API
docker compose -f docker-compose.vps.yml restart api

# 4. Si ça ne marche pas, rebuild
docker compose -f docker-compose.vps.yml up -d --build api
```

### Base de données corrompue

```bash
# 1. Arrêter l'API
docker compose -f docker-compose.vps.yml stop api

# 2. Restaurer depuis un backup
gunzip < backup.sql.gz | docker exec -i xamle-postgres psql -U xamle_prod -d xamle_civic_prod

# 3. Redémarrer
docker compose -f docker-compose.vps.yml start api
```

### Espace disque plein

```bash
# 1. Vérifier l'espace
df -h

# 2. Nettoyer Docker
docker system prune -a

# 3. Nettoyer les logs
docker compose -f docker-compose.vps.yml logs --tail=0

# 4. Nettoyer les backups anciens
find /home/xamle/backups -name "*.sql.gz" -mtime +7 -delete
```

### Certificat SSL expiré

```bash
# 1. Renouveler
docker compose -f docker-compose.vps.yml run --rm certbot renew

# 2. Redémarrer Nginx
docker compose -f docker-compose.vps.yml restart nginx

# 3. Vérifier
curl -I https://api.xamle.sn
```

---

## 🔧 Développement Local

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-org/xamle-civic.git
cd xamle-civic

# Installer les dépendances
pnpm install

# Copier les .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Services Docker (dev)

```bash
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down
```

### API (dev)

```bash
cd apps/api

# Migrations
pnpm run db:migrate

# Seed
pnpm run db:seed

# Démarrer en dev
pnpm run dev

# Build
pnpm run build

# Tests
pnpm run test
```

### Web (dev)

```bash
cd apps/web

# Démarrer en dev
pnpm run dev

# Build
pnpm run build

# Démarrer en prod
pnpm run start
```

---

## 📝 Git

### Workflow

```bash
# Créer une branche
git checkout -b feature/nouvelle-fonctionnalite

# Commit
git add .
git commit -m "feat: ajout de la nouvelle fonctionnalité"

# Push
git push origin feature/nouvelle-fonctionnalite

# Merge vers main
git checkout main
git merge feature/nouvelle-fonctionnalite
git push origin main
```

### Tags

```bash
# Créer un tag
git tag -a v1.0.0 -m "Version 1.0.0"

# Push le tag
git push origin v1.0.0

# Lister les tags
git tag
```

---

## 🔐 Sécurité

### Générer des Secrets

```bash
# JWT Secret (32 bytes)
openssl rand -base64 32

# Meilisearch Master Key (24 bytes)
openssl rand -base64 24

# MinIO Access Key
echo "xamle_minio_$(openssl rand -hex 8)"

# MinIO Secret Key (32 bytes)
openssl rand -base64 32
```

### Firewall (UFW)

```bash
# Activer le firewall
ufw enable

# Autoriser SSH
ufw allow 22/tcp

# Autoriser HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Vérifier le statut
ufw status
```

---

## 📞 Support

Pour plus d'informations, voir :
- `DEPLOYMENT.md` — Guide complet
- `DEPLOYMENT-QUICK.md` — Guide rapide
- `DEPLOYMENT-SUMMARY.md` — Résumé
