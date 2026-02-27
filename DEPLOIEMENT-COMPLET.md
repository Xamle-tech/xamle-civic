# 🚀 Guide de Déploiement Complet - Xamle Civic

## Architecture de Déploiement

- **Backend (API + Services)** → VPS avec Docker
- **Frontend (Next.js)** → Vercel
- **Base de données** → PostgreSQL sur VPS
- **Cache** → Redis sur VPS
- **Recherche** → Meilisearch sur VPS
- **Stockage** → MinIO (S3) sur VPS

---

## 📦 Partie 1 : Déploiement Backend sur VPS

### Prérequis VPS

- Ubuntu 22.04 LTS ou supérieur
- Minimum 2 CPU / 4GB RAM
- 50GB de stockage
- Accès SSH root ou sudo
- Nom de domaine configuré (ex: `api.xamle.sn`)

### 1.1 Préparation du VPS

```bash
# Se connecter au VPS
ssh root@votre-vps-ip

# Mettre à jour le système
apt update && apt upgrade -y

# Installer les dépendances
apt install -y curl git ufw fail2ban

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installer Docker Compose
apt install -y docker-compose-plugin

# Vérifier les installations
docker --version
docker compose version

# Configurer le firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

### 1.2 Configuration DNS

Configurez vos enregistrements DNS :

```
Type    Nom              Valeur              TTL
A       api.xamle.sn     VOTRE_VPS_IP       300
A       @                VOTRE_VPS_IP       300
```

### 1.3 Cloner le Projet

```bash
# Créer un utilisateur pour l'application
adduser xamle
usermod -aG docker xamle
su - xamle

# Cloner le repository
cd ~
git clone https://github.com/votre-username/xamle-civic.git
cd xamle-civic
```

### 1.4 Configuration des Variables d'Environnement

```bash
# Copier le fichier d'exemple
cp backend/.env.example .env.production

# Éditer le fichier avec vos valeurs
nano .env.production
```

**Variables critiques à modifier :**

```bash
# Domaine
DOMAIN=api.xamle.sn
APP_URL=https://xamle.sn

# Base de données (générer des mots de passe forts)
POSTGRES_USER=xamle_prod
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_FORT_ICI
POSTGRES_DB=xamle_civic_prod

# Redis
REDIS_PASSWORD=VOTRE_MOT_DE_PASSE_REDIS

# JWT (générer avec: openssl rand -base64 32)
JWT_SECRET=VOTRE_JWT_SECRET_32_CHARS_MIN
REFRESH_TOKEN_SECRET=VOTRE_REFRESH_SECRET_32_CHARS_MIN

# CORS (votre frontend Vercel)
CORS_ORIGINS=https://xamle.sn,https://www.xamle.sn,https://xamle.vercel.app

# Meilisearch
MEILISEARCH_MASTER_KEY=VOTRE_MEILISEARCH_KEY_16_CHARS_MIN

# MinIO
MINIO_ACCESS_KEY=VOTRE_MINIO_ACCESS_KEY
MINIO_SECRET_KEY=VOTRE_MINIO_SECRET_KEY_32_CHARS_MIN

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@xamle.sn
SMTP_PASSWORD=VOTRE_MOT_DE_PASSE_APP_GMAIL
SMTP_FROM="Xamle Civic <noreply@xamle.sn>"

# SSL
SSL_EMAIL=admin@xamle.sn
```

### 1.5 Obtenir un Certificat SSL (Let's Encrypt)

```bash
# D'abord, démarrer Nginx en mode HTTP seulement
docker compose -f docker-compose.vps.yml up -d nginx

# Obtenir le certificat SSL
docker compose -f docker-compose.vps.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@xamle.sn \
  --agree-tos \
  --no-eff-email \
  -d api.xamle.sn

# Redémarrer Nginx avec SSL
docker compose -f docker-compose.vps.yml restart nginx
```

### 1.6 Démarrer les Services

```bash
# Lancer tous les services
docker compose -f docker-compose.vps.yml up -d

# Vérifier les logs
docker compose -f docker-compose.vps.yml logs -f api

# Vérifier le statut
docker compose -f docker-compose.vps.yml ps
```

### 1.7 Initialiser la Base de Données

```bash
# Les migrations se font automatiquement au démarrage de l'API
# Mais vous pouvez les exécuter manuellement si nécessaire :

docker compose -f docker-compose.vps.yml exec api sh -c "npx prisma migrate deploy"

# Seed initial (optionnel)
docker compose -f docker-compose.vps.yml exec api sh -c "npx prisma db seed"
```

### 1.8 Vérification

```bash
# Tester l'API
curl https://api.xamle.sn/health
# Devrait retourner: {"status":"ok"}

# Tester l'API documentation
curl https://api.xamle.sn/api/docs
# Devrait retourner la page Swagger

# Vérifier les logs
docker compose -f docker-compose.vps.yml logs -f
```

### 1.9 Configuration du Renouvellement SSL Automatique

Le certificat SSL se renouvelle automatiquement via le service Certbot dans Docker Compose. Vérifiez avec :

```bash
# Tester le renouvellement
docker compose -f docker-compose.vps.yml exec certbot certbot renew --dry-run
```

---

## 🌐 Partie 2 : Déploiement Frontend sur Vercel

### 2.1 Prérequis

- Compte Vercel (gratuit)
- Repository GitHub/GitLab/Bitbucket
- Node.js 20+ en local pour tester

### 2.2 Préparation du Frontend

Créez un fichier de configuration Vercel à la racine du projet :

**`vercel.json`**

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "regions": ["cdg1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://api.xamle.sn/api/v1",
    "NEXT_PUBLIC_WS_URL": "wss://api.xamle.sn",
    "NEXT_PUBLIC_APP_URL": "https://xamle.sn",
    "NEXT_PUBLIC_MEILISEARCH_URL": "https://api.xamle.sn/search",
    "NEXT_PUBLIC_STORAGE_URL": "https://api.xamle.sn/storage"
  }
}
```

### 2.3 Configuration des Variables d'Environnement Frontend

Créez `.env.production` dans le dossier `frontend/` :

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://api.xamle.sn/api/v1
NEXT_PUBLIC_WS_URL=wss://api.xamle.sn
NEXT_PUBLIC_APP_URL=https://xamle.sn

# Services
NEXT_PUBLIC_MEILISEARCH_URL=https://api.xamle.sn/search
NEXT_PUBLIC_STORAGE_URL=https://api.xamle.sn/storage

# Google OAuth (pour le frontend)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre-google-client-id.apps.googleusercontent.com

# Analytics (optionnel)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

### 2.4 Déploiement via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter à Vercel
vercel login

# Déployer depuis la racine du projet
vercel

# Suivre les instructions :
# ? Set up and deploy "~/xamle-civic"? [Y/n] y
# ? Which scope? Votre compte
# ? Link to existing project? [y/N] n
# ? What's your project's name? xamle-civic
# ? In which directory is your code located? ./frontend
```

### 2.5 Configuration du Projet sur Vercel Dashboard

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet `xamle-civic`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez toutes les variables d'environnement :

```
NEXT_PUBLIC_API_URL = https://api.xamle.sn/api/v1
NEXT_PUBLIC_WS_URL = wss://api.xamle.sn
NEXT_PUBLIC_APP_URL = https://xamle.sn
NEXT_PUBLIC_MEILISEARCH_URL = https://api.xamle.sn/search
NEXT_PUBLIC_STORAGE_URL = https://api.xamle.sn/storage
NEXT_PUBLIC_GOOGLE_CLIENT_ID = votre-client-id
```

5. Allez dans **Settings** → **Domains**
6. Ajoutez votre domaine personnalisé : `xamle.sn` et `www.xamle.sn`

### 2.6 Configuration du Domaine Personnalisé

Dans votre DNS, ajoutez :

```
Type     Nom    Valeur                      TTL
CNAME    @      cname.vercel-dns.com        300
CNAME    www    cname.vercel-dns.com        300
```

Ou si vous utilisez un domaine racine :

```
Type     Nom    Valeur              TTL
A        @      76.76.21.21         300
AAAA     @      2606:4700:4700::1111  300
CNAME    www    cname.vercel-dns.com  300
```

### 2.7 Configuration Build & Deployment

Dans **Settings** → **General** :

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 20.x

### 2.8 Déploiement Automatique

Configurez le déploiement automatique :

1. **Settings** → **Git**
2. Connectez votre repository GitHub
3. Configurez les branches :
   - **Production Branch**: `main` → déploie sur `xamle.sn`
   - **Preview Branches**: toutes les autres → déploie sur des URLs de preview

### 2.9 Vérification du Déploiement

```bash
# Tester le frontend
curl https://xamle.sn
# Devrait retourner le HTML de votre page

# Vérifier les logs
vercel logs xamle-civic

# Tester l'API depuis le frontend
# Ouvrez https://xamle.sn dans le navigateur
# Ouvrez la console développeur et vérifiez les appels API
```

---

## 🔄 Partie 3 : Workflow de Déploiement

### 3.1 Déploiement Backend (VPS)

```bash
# Se connecter au VPS
ssh xamle@votre-vps-ip

# Aller dans le projet
cd ~/xamle-civic

# Récupérer les dernières modifications
git pull origin main

# Rebuild et redémarrer les services
docker compose -f docker-compose.vps.yml down
docker compose -f docker-compose.vps.yml build --no-cache
docker compose -f docker-compose.vps.yml up -d

# Vérifier les logs
docker compose -f docker-compose.vps.yml logs -f api
```

### 3.2 Déploiement Frontend (Vercel)

Vercel déploie automatiquement à chaque push sur `main`. Mais vous pouvez aussi :

```bash
# Déploiement manuel
cd frontend
vercel --prod

# Ou depuis la racine
vercel --prod --cwd frontend
```

### 3.3 Rollback en Cas de Problème

**Backend (VPS) :**

```bash
# Revenir à une version précédente
git log --oneline  # Trouver le commit
git checkout <commit-hash>
docker compose -f docker-compose.vps.yml up -d --build
```

**Frontend (Vercel) :**

1. Allez sur le dashboard Vercel
2. **Deployments** → sélectionnez un déploiement précédent
3. Cliquez sur **Promote to Production**

---

## 📊 Partie 4 : Monitoring et Maintenance

### 4.1 Monitoring avec Uptime Kuma

Uptime Kuma est déjà configuré dans le docker-compose :

```bash
# Accéder à Uptime Kuma
ssh -L 3001:localhost:3001 xamle@votre-vps-ip

# Ouvrir dans le navigateur : http://localhost:3001
```

Configurez les moniteurs pour :
- API Health : `https://api.xamle.sn/health`
- Frontend : `https://xamle.sn`
- PostgreSQL
- Redis
- Meilisearch
- MinIO

### 4.2 Logs et Debugging

**Backend :**

```bash
# Logs de tous les services
docker compose -f docker-compose.vps.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.vps.yml logs -f api
docker compose -f docker-compose.vps.yml logs -f postgres
docker compose -f docker-compose.vps.yml logs -f nginx

# Entrer dans un conteneur
docker compose -f docker-compose.vps.yml exec api sh
```

**Frontend (Vercel) :**

```bash
# Logs en temps réel
vercel logs xamle-civic --follow

# Logs d'un déploiement spécifique
vercel logs <deployment-url>
```

### 4.3 Backups

**Base de données PostgreSQL :**

```bash
# Créer un backup
docker compose -f docker-compose.vps.yml exec postgres pg_dump -U xamle_prod xamle_civic_prod > backup_$(date +%Y%m%d).sql

# Restaurer un backup
cat backup_20260227.sql | docker compose -f docker-compose.vps.yml exec -T postgres psql -U xamle_prod xamle_civic_prod
```

**Automatiser les backups (crontab) :**

```bash
# Éditer crontab
crontab -e

# Ajouter (backup quotidien à 2h du matin)
0 2 * * * cd ~/xamle-civic && docker compose -f docker-compose.vps.yml exec postgres pg_dump -U xamle_prod xamle_civic_prod > ~/backups/backup_$(date +\%Y\%m\%d).sql

# Nettoyer les vieux backups (garder 30 jours)
0 3 * * * find ~/backups -name "backup_*.sql" -mtime +30 -delete
```

### 4.4 Mises à Jour de Sécurité

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Mettre à jour les images Docker
docker compose -f docker-compose.vps.yml pull
docker compose -f docker-compose.vps.yml up -d

# Nettoyer les anciennes images
docker system prune -a
```

---

## 🔒 Partie 5 : Sécurité

### 5.1 Configuration SSH Sécurisée

```bash
# Éditer la config SSH
sudo nano /etc/ssh/sshd_config

# Modifier :
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes

# Redémarrer SSH
sudo systemctl restart sshd
```

### 5.2 Fail2Ban

```bash
# Installer et configurer Fail2Ban
sudo apt install fail2ban -y

# Créer une configuration locale
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Éditer
sudo nano /etc/fail2ban/jail.local

# Activer pour SSH et Nginx
[sshd]
enabled = true
maxretry = 3

[nginx-http-auth]
enabled = true

# Redémarrer
sudo systemctl restart fail2ban
```

### 5.3 Secrets Management

**Ne jamais commiter les fichiers `.env` !**

Utilisez des secrets managers :
- Variables d'environnement Vercel pour le frontend
- Fichier `.env.production` sur le VPS (non versionné)
- Ou utilisez des services comme HashiCorp Vault, AWS Secrets Manager

---

## 🚨 Partie 6 : Troubleshooting

### Problème : API ne répond pas

```bash
# Vérifier le statut des conteneurs
docker compose -f docker-compose.vps.yml ps

# Vérifier les logs
docker compose -f docker-compose.vps.yml logs api

# Redémarrer l'API
docker compose -f docker-compose.vps.yml restart api
```

### Problème : Erreur de connexion à la base de données

```bash
# Vérifier PostgreSQL
docker compose -f docker-compose.vps.yml logs postgres

# Se connecter à PostgreSQL
docker compose -f docker-compose.vps.yml exec postgres psql -U xamle_prod -d xamle_civic_prod

# Vérifier les migrations
docker compose -f docker-compose.vps.yml exec api npx prisma migrate status
```

### Problème : Certificat SSL expiré

```bash
# Renouveler manuellement
docker compose -f docker-compose.vps.yml run --rm certbot renew

# Redémarrer Nginx
docker compose -f docker-compose.vps.yml restart nginx
```

### Problème : Frontend ne peut pas joindre l'API

1. Vérifiez les CORS dans `.env.production` du backend
2. Vérifiez `NEXT_PUBLIC_API_URL` sur Vercel
3. Testez l'API directement : `curl https://api.xamle.sn/health`

---

## 📝 Checklist de Déploiement

### Backend (VPS)

- [ ] VPS configuré avec Ubuntu 22.04+
- [ ] Docker et Docker Compose installés
- [ ] DNS configuré (api.xamle.sn → VPS IP)
- [ ] Fichier `.env.production` créé avec toutes les variables
- [ ] Certificat SSL obtenu avec Let's Encrypt
- [ ] Services Docker démarrés
- [ ] Migrations de base de données exécutées
- [ ] API accessible sur `https://api.xamle.sn/health`
- [ ] Firewall configuré (UFW)
- [ ] Fail2Ban activé
- [ ] Backups automatiques configurés
- [ ] Monitoring avec Uptime Kuma

### Frontend (Vercel)

- [ ] Compte Vercel créé
- [ ] Repository connecté à Vercel
- [ ] Variables d'environnement configurées
- [ ] Domaine personnalisé ajouté (xamle.sn)
- [ ] DNS configuré pour pointer vers Vercel
- [ ] Déploiement réussi
- [ ] Frontend accessible sur `https://xamle.sn`
- [ ] API calls fonctionnent depuis le frontend
- [ ] Déploiement automatique configuré

---

## 🎯 URLs Finales

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | https://xamle.sn | Application Next.js |
| API | https://api.xamle.sn/api/v1 | Backend NestJS |
| API Docs | https://api.xamle.sn/api/docs | Swagger UI |
| Health Check | https://api.xamle.sn/health | Status API |
| Meilisearch | https://api.xamle.sn/search | Recherche full-text |
| MinIO Console | https://api.xamle.sn/minio-console | Interface MinIO |
| Storage | https://api.xamle.sn/storage | Fichiers publics |

---

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `docker compose logs -f`
2. Consultez la documentation : `/docs`
3. Ouvrez une issue sur GitHub

**Bon déploiement ! 🚀**
