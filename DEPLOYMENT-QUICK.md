# Déploiement Rapide — Xamle Civic

## 🎯 Vue d'Ensemble

- **Backend** : VPS (Docker) → `api.xamle.sn`
- **Frontend** : Vercel → `xamle.sn`

---

## 📦 VPS (Backend)

### 1. Préparation (5 min)

```bash
# SSH vers le VPS
ssh root@votre-vps-ip

# Installation Docker
curl -fsSL https://get.docker.com | sh
apt install docker-compose-plugin -y

# Clone du projet
git clone https://github.com/votre-org/xamle-civic.git
cd xamle-civic
```

### 2. Configuration (10 min)

```bash
# Copier et éditer .env
cp .env.production.example .env.production
nano .env.production
```

**Variables essentielles** :

```bash
DOMAIN=api.xamle.sn
APP_URL=https://xamle.sn
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
MEILISEARCH_MASTER_KEY=$(openssl rand -base64 24)
MINIO_ACCESS_KEY=xamle_minio_$(openssl rand -hex 8)
MINIO_SECRET_KEY=$(openssl rand -base64 32)
SSL_EMAIL=admin@xamle.sn
CORS_ORIGINS=https://xamle.sn,https://www.xamle.sn
```

### 3. Déploiement (5 min)

```bash
# Lancer le déploiement
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

### 4. SSL (2 min)

```bash
# Configurer HTTPS
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh
```

### 5. Vérification

```bash
# Tester l'API
curl https://api.xamle.sn/health
curl https://api.xamle.sn/api/v1/policies
```

---

## 🌐 Vercel (Frontend)

### 1. Import (2 min)

1. Aller sur [vercel.com](https://vercel.com)
2. **Add New Project** → Import votre repository
3. Root Directory : `apps/web`

### 2. Variables d'Environnement (2 min)

Dans Settings → Environment Variables :

```bash
NEXT_PUBLIC_API_URL=https://api.xamle.sn
NEXT_PUBLIC_APP_URL=https://xamle.sn
NEXT_PUBLIC_MINIO_ENDPOINT=https://api.xamle.sn/storage
```

### 3. Build Settings (1 min)

- **Build Command** : `cd ../.. && pnpm install && pnpm --filter @xamle/web build`
- **Output Directory** : `.next`
- **Install Command** : `cd ../.. && pnpm install`

### 4. Domaine (5 min)

Dans Settings → Domains :

1. Ajouter `xamle.sn`
2. Configurer DNS selon instructions Vercel

### 5. Deploy

```bash
git push origin main
```

Vercel déploie automatiquement !

---

## ✅ Checklist Finale

### VPS
- [ ] DNS `api.xamle.sn` → IP VPS
- [ ] `.env.production` configuré
- [ ] Services Docker démarrés
- [ ] SSL configuré
- [ ] API répond sur `https://api.xamle.sn/health`
- [ ] Firewall activé (ports 80, 443, 22)

### Vercel
- [ ] Repository importé
- [ ] Variables d'environnement configurées
- [ ] Build settings corrects
- [ ] Domaine configuré
- [ ] Site accessible sur `https://xamle.sn`
- [ ] Login fonctionne

---

## 🔄 Mises à Jour

### Backend
```bash
cd ~/xamle-civic
git pull
./scripts/deploy-vps.sh
```

### Frontend
```bash
git push origin main
# Vercel déploie automatiquement
```

---

## 🐛 Problèmes Courants

### CORS Error
```bash
# Vérifier CORS_ORIGINS dans .env.production
nano .env.production
docker compose -f docker-compose.vps.yml restart api
```

### SSL Error
```bash
# Renouveler le certificat
docker compose -f docker-compose.vps.yml run --rm certbot renew
docker compose -f docker-compose.vps.yml restart nginx
```

### API Down
```bash
# Voir les logs
docker compose -f docker-compose.vps.yml logs -f api

# Redémarrer
docker compose -f docker-compose.vps.yml restart api
```

---

## 📞 Documentation Complète

Voir `DEPLOYMENT.md` pour le guide détaillé.
