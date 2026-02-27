# 📚 Documentation de Déploiement - Xamle Civic

## 📖 Guides Disponibles

### 1. ⚡ [Guide Rapide](./DEPLOIEMENT-RAPIDE.md)
**Pour démarrer rapidement (25 minutes)**
- Instructions pas à pas
- Commandes prêtes à copier-coller
- Configuration minimale

### 2. 📘 [Guide Complet](./DEPLOIEMENT-COMPLET.md)
**Pour une compréhension approfondie**
- Architecture détaillée
- Configuration avancée
- Monitoring et maintenance
- Sécurité
- Troubleshooting

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UTILISATEURS                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
        ┌─────────────────────────────────┐
        │                                 │
        ▼                                 ▼
┌──────────────┐                 ┌──────────────┐
│   FRONTEND   │                 │   BACKEND    │
│   (Vercel)   │────────────────▶│    (VPS)     │
│  xamle.sn    │                 │ api.xamle.sn │
└──────────────┘                 └──────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
            ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
            │  PostgreSQL  │    │    Redis     │    │ Meilisearch  │
            │  (Database)  │    │   (Cache)    │    │   (Search)   │
            └──────────────┘    └──────────────┘    └──────────────┘
                                         │
                                         ▼
                                 ┌──────────────┐
                                 │    MinIO     │
                                 │  (Storage)   │
                                 └──────────────┘
```

---

## 🚀 Déploiement en 3 Étapes

### Étape 1 : Préparer le VPS
```bash
curl -fsSL https://raw.githubusercontent.com/votre-username/xamle-civic/main/scripts/setup-vps.sh | bash
```

### Étape 2 : Déployer le Backend
```bash
cd xamle-civic
cp backend/.env.example .env.production
# Éditer .env.production avec vos valeurs
./scripts/ssl-setup.sh
./scripts/deploy-vps.sh
```

### Étape 3 : Déployer le Frontend
```bash
vercel login
vercel
# Configurer les variables d'environnement sur Vercel Dashboard
vercel --prod
```

---

## 📦 Scripts Disponibles

### Backend (VPS)

| Script | Description |
|--------|-------------|
| `scripts/setup-vps.sh` | Installation initiale du VPS |
| `scripts/ssl-setup.sh` | Configuration SSL Let's Encrypt |
| `scripts/deploy-vps.sh` | Déploiement du backend |

### Frontend (Vercel)

Le déploiement se fait automatiquement via :
- **Push sur `main`** → Déploiement en production
- **Pull Request** → Déploiement preview

---

## 🔐 Variables d'Environnement

### Backend (`.env.production`)

```bash
# Application
DOMAIN=api.xamle.sn
APP_URL=https://xamle.sn

# Database
POSTGRES_PASSWORD=***
DATABASE_URL=postgresql://...

# Cache
REDIS_PASSWORD=***

# Auth
JWT_SECRET=***
REFRESH_TOKEN_SECRET=***

# Services
MEILISEARCH_MASTER_KEY=***
MINIO_ACCESS_KEY=***
MINIO_SECRET_KEY=***

# CORS
CORS_ORIGINS=https://xamle.sn,https://www.xamle.sn
```

### Frontend (Vercel Dashboard)

```bash
NEXT_PUBLIC_API_URL=https://api.xamle.sn/api/v1
NEXT_PUBLIC_WS_URL=wss://api.xamle.sn
NEXT_PUBLIC_APP_URL=https://xamle.sn
NEXT_PUBLIC_MEILISEARCH_URL=https://api.xamle.sn/search
NEXT_PUBLIC_STORAGE_URL=https://api.xamle.sn/storage
```

---

## 🌐 Configuration DNS

### Backend (VPS)
```
Type: A
Nom: api.xamle.sn
Valeur: VOTRE_VPS_IP
```

### Frontend (Vercel)
```
Type: CNAME
Nom: @
Valeur: cname.vercel-dns.com

Type: CNAME
Nom: www
Valeur: cname.vercel-dns.com
```

---

## 🛠️ Commandes Utiles

### Backend

```bash
# Logs
docker compose -f docker-compose.vps.yml logs -f

# Redémarrer
docker compose -f docker-compose.vps.yml restart

# Statut
docker compose -f docker-compose.vps.yml ps

# Backup
docker compose -f docker-compose.vps.yml exec postgres pg_dump -U xamle_prod xamle_civic_prod > backup.sql

# Migrations
docker compose -f docker-compose.vps.yml exec api npx prisma migrate deploy
```

### Frontend

```bash
# Logs
vercel logs xamle-civic --follow

# Déployer
vercel --prod

# Rollback
vercel rollback

# Lister les déploiements
vercel ls
```

---

## 📊 Monitoring

### Uptime Kuma (Monitoring)

Accès via tunnel SSH :
```bash
ssh -L 3001:localhost:3001 xamle@votre-vps-ip
```
Puis ouvrir : `http://localhost:3001`

### Logs

**Backend :**
```bash
docker compose -f docker-compose.vps.yml logs -f api
```

**Frontend :**
```bash
vercel logs xamle-civic --follow
```

---

## 🔄 Workflow de Développement

```
1. Développement local
   ├── Backend: npm run dev (port 4000)
   └── Frontend: npm run dev (port 3001)

2. Commit & Push
   └── git push origin feature-branch

3. Pull Request
   ├── Tests automatiques (GitHub Actions)
   └── Preview deployment (Vercel)

4. Merge vers main
   ├── Frontend: Auto-deploy sur Vercel
   └── Backend: Deploy manuel sur VPS
```

---

## 🚨 Troubleshooting

### Problème : API ne répond pas
```bash
docker compose -f docker-compose.vps.yml logs api
docker compose -f docker-compose.vps.yml restart api
```

### Problème : Erreur de connexion DB
```bash
docker compose -f docker-compose.vps.yml logs postgres
docker compose -f docker-compose.vps.yml exec postgres psql -U xamle_prod -d xamle_civic_prod
```

### Problème : SSL expiré
```bash
docker compose -f docker-compose.vps.yml run --rm certbot renew
docker compose -f docker-compose.vps.yml restart nginx
```

### Problème : Frontend ne peut pas joindre l'API
1. Vérifier `CORS_ORIGINS` dans `.env.production`
2. Vérifier `NEXT_PUBLIC_API_URL` sur Vercel
3. Tester : `curl https://api.xamle.sn/health`

---

## 📞 Support

- **Guide Rapide** : [DEPLOIEMENT-RAPIDE.md](./DEPLOIEMENT-RAPIDE.md)
- **Guide Complet** : [DEPLOIEMENT-COMPLET.md](./DEPLOIEMENT-COMPLET.md)
- **Issues** : [GitHub Issues](https://github.com/votre-username/xamle-civic/issues)

---

## ✅ Checklist de Déploiement

### Avant de Déployer
- [ ] VPS configuré (Ubuntu 22.04+, 2CPU/4GB RAM)
- [ ] Domaines enregistrés (xamle.sn, api.xamle.sn)
- [ ] Compte Vercel créé
- [ ] Repository GitHub configuré

### Backend (VPS)
- [ ] Script `setup-vps.sh` exécuté
- [ ] DNS configuré (api.xamle.sn → VPS IP)
- [ ] `.env.production` configuré
- [ ] SSL obtenu avec Let's Encrypt
- [ ] Services Docker démarrés
- [ ] Migrations DB exécutées
- [ ] `https://api.xamle.sn/health` répond

### Frontend (Vercel)
- [ ] Variables d'environnement configurées
- [ ] Domaine ajouté sur Vercel
- [ ] DNS configuré (xamle.sn → Vercel)
- [ ] Déploiement réussi
- [ ] `https://xamle.sn` accessible
- [ ] API calls fonctionnent

### Post-Déploiement
- [ ] Monitoring configuré (Uptime Kuma)
- [ ] Backups automatiques configurés
- [ ] Fail2Ban activé
- [ ] Firewall configuré (UFW)
- [ ] Tests E2E passent

---

**Bon déploiement ! 🚀**
