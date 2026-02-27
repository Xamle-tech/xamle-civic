# Résumé — Configuration de Déploiement

## ✅ Fichiers Créés

### Configuration Docker (VPS)
- ✅ `docker-compose.vps.yml` — Stack backend complète
- ✅ `nginx/nginx.vps.conf` — Reverse proxy avec SSL
- ✅ `.env.production.example` — Variables d'environnement backend
- ✅ `apps/api/Dockerfile` — Image Docker de l'API (déjà existant)

### Configuration Vercel (Frontend)
- ✅ `apps/web/vercel.json` — Configuration Vercel
- ✅ `apps/web/.env.production.example` — Variables d'environnement frontend

### Scripts de Déploiement
- ✅ `scripts/deploy-vps.sh` — Script de déploiement automatique VPS
- ✅ `scripts/setup-ssl.sh` — Configuration SSL Let's Encrypt

### Documentation
- ✅ `DEPLOYMENT.md` — Guide complet (détaillé)
- ✅ `DEPLOYMENT-QUICK.md` — Guide rapide (20 min)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        INTERNET                              │
└────────────┬────────────────────────────┬───────────────────┘
             │                            │
             │                            │
     ┌───────▼────────┐          ┌────────▼──────────┐
     │  Vercel CDN    │          │   VPS (Docker)    │
     │  xamle.sn      │          │  api.xamle.sn     │
     │                │          │                   │
     │  Next.js App   │◄─────────┤  Nginx (SSL)      │
     └────────────────┘          │  ├─ API (NestJS)  │
                                 │  ├─ PostgreSQL    │
                                 │  ├─ Redis         │
                                 │  ├─ Meilisearch   │
                                 │  └─ MinIO (S3)    │
                                 └───────────────────┘
```

---

## 📋 Stack Technique

### Backend (VPS)
- **API** : NestJS (Node.js 20)
- **Base de données** : PostgreSQL 16
- **Cache** : Redis 7
- **Recherche** : Meilisearch 1.7
- **Stockage** : MinIO (S3-compatible)
- **Reverse Proxy** : Nginx + Let's Encrypt
- **Monitoring** : Uptime Kuma
- **Orchestration** : Docker Compose

### Frontend (Vercel)
- **Framework** : Next.js 14
- **Déploiement** : Vercel (CDN global)
- **SSL** : Automatique (Vercel)
- **CI/CD** : Automatique (Git push)

---

## 🚀 Déploiement en 3 Étapes

### 1. VPS (Backend) — 20 minutes

```bash
# Sur le VPS
git clone https://github.com/votre-org/xamle-civic.git
cd xamle-civic
cp .env.production.example .env.production
nano .env.production  # Remplir les variables
./scripts/deploy-vps.sh
./scripts/setup-ssl.sh
```

### 2. Vercel (Frontend) — 10 minutes

1. Import repository sur vercel.com
2. Root Directory : `apps/web`
3. Ajouter variables d'environnement :
   - `NEXT_PUBLIC_API_URL=https://api.xamle.sn`
   - `NEXT_PUBLIC_APP_URL=https://xamle.sn`
4. Deploy

### 3. DNS — 5 minutes

```
A       api.xamle.sn     → IP_VPS
A       xamle.sn         → 76.76.21.21 (Vercel)
CNAME   www.xamle.sn     → cname.vercel-dns.com
```

---

## 🔐 Variables d'Environnement Critiques

### Backend (.env.production)

```bash
# Domaines
DOMAIN=api.xamle.sn
APP_URL=https://xamle.sn
CORS_ORIGINS=https://xamle.sn,https://www.xamle.sn

# Sécurité (générer avec: openssl rand -base64 32)
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...
JWT_SECRET=...
REFRESH_TOKEN_SECRET=...
MEILISEARCH_MASTER_KEY=...
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...

# Email
SSL_EMAIL=admin@xamle.sn
SMTP_HOST=smtp.gmail.com
SMTP_USER=noreply@xamle.sn
SMTP_PASSWORD=...
```

### Frontend (Vercel)

```bash
NEXT_PUBLIC_API_URL=https://api.xamle.sn
NEXT_PUBLIC_APP_URL=https://xamle.sn
NEXT_PUBLIC_MINIO_ENDPOINT=https://api.xamle.sn/storage
```

---

## 🔍 Vérification Post-Déploiement

### Backend (VPS)

```bash
# Health check
curl https://api.xamle.sn/health

# API
curl https://api.xamle.sn/api/v1/policies

# Swagger
open https://api.xamle.sn/api/docs

# Services Docker
docker compose -f docker-compose.vps.yml ps
```

### Frontend (Vercel)

```bash
# Site web
open https://xamle.sn

# Test login
# 1. Ouvrir https://xamle.sn/auth/login
# 2. Se connecter avec admin@xamle.sn / Admin@1234
# 3. Vérifier la redirection vers /admin/policies
```

---

## 🛠️ Maintenance

### Mises à Jour

```bash
# Backend
cd ~/xamle-civic
git pull
./scripts/deploy-vps.sh

# Frontend (automatique)
git push origin main
```

### Backups

```bash
# Backup PostgreSQL
docker exec xamle-postgres pg_dump -U xamle_prod xamle_civic_prod | gzip > backup.sql.gz

# Backup MinIO
docker exec xamle-minio mc mirror local/xamle-documents ./backup/documents
```

### Monitoring

- **Uptime Kuma** : http://VPS_IP:3001
- **Logs** : `docker compose -f docker-compose.vps.yml logs -f`
- **Stats** : `docker stats`

---

## 📊 Coûts Estimés

### VPS
- **Hetzner CX31** : ~10€/mois (4 CPU, 8 GB RAM, 80 GB SSD)
- **DigitalOcean Droplet** : ~24$/mois (4 CPU, 8 GB RAM, 160 GB SSD)
- **OVH VPS** : ~15€/mois (4 vCore, 8 GB RAM, 80 GB SSD)

### Vercel
- **Hobby** : Gratuit (100 GB bandwidth/mois)
- **Pro** : 20$/mois (1 TB bandwidth/mois)

### Domaine
- **.sn** : ~30€/an
- **.com** : ~12€/an

**Total estimé** : ~25-40€/mois

---

## 🎯 Prochaines Étapes

1. [ ] Configurer le VPS et déployer le backend
2. [ ] Configurer Vercel et déployer le frontend
3. [ ] Configurer les DNS
4. [ ] Tester le site complet
5. [ ] Configurer les backups automatiques
6. [ ] Configurer le monitoring (Uptime Kuma)
7. [ ] Configurer les alertes email
8. [ ] Documenter les procédures d'urgence

---

## 📞 Support

- **Documentation complète** : `DEPLOYMENT.md`
- **Guide rapide** : `DEPLOYMENT-QUICK.md`
- **Issues** : GitHub Issues
- **Email** : tech@xamle.sn
