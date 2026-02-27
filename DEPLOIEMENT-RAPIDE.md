# ⚡ Guide de Déploiement Rapide - Xamle Civic

## 🎯 Vue d'ensemble

- **Backend** → VPS (Docker) → `https://api.xamle.sn`
- **Frontend** → Vercel → `https://xamle.sn`

---

## 🚀 Partie 1 : Backend sur VPS (15 minutes)

### Étape 1 : Préparer le VPS

```bash
# Se connecter au VPS
ssh root@votre-vps-ip

# Exécuter le script d'installation
curl -fsSL https://raw.githubusercontent.com/votre-username/xamle-civic/main/scripts/setup-vps.sh | bash

# Ou si vous avez déjà cloné le repo
./scripts/setup-vps.sh
```

### Étape 2 : Configurer DNS

Ajoutez cet enregistrement DNS :

```
Type: A
Nom: api.xamle.sn
Valeur: VOTRE_VPS_IP
TTL: 300
```

### Étape 3 : Configurer les Variables

```bash
# Se connecter en tant qu'utilisateur xamle
su - xamle

# Cloner le projet
git clone https://github.com/votre-username/xamle-civic.git
cd xamle-civic

# Copier et éditer le fichier d'environnement
cp backend/.env.example .env.production
nano .env.production
```

**Variables minimales à modifier :**

```bash
DOMAIN=api.xamle.sn
POSTGRES_PASSWORD=VOTRE_MOT_DE_PASSE_FORT
REDIS_PASSWORD=VOTRE_MOT_DE_PASSE_REDIS
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
MEILISEARCH_MASTER_KEY=$(openssl rand -base64 16)
MINIO_ACCESS_KEY=votre_access_key
MINIO_SECRET_KEY=$(openssl rand -base64 32)
CORS_ORIGINS=https://xamle.sn,https://www.xamle.sn
SSL_EMAIL=admin@xamle.sn
```

### Étape 4 : Obtenir le Certificat SSL

```bash
./scripts/ssl-setup.sh
```

### Étape 5 : Déployer

```bash
./scripts/deploy-vps.sh
```

### Étape 6 : Vérifier

```bash
# Tester l'API
curl https://api.xamle.sn/health

# Voir les logs
docker compose -f docker-compose.vps.yml logs -f api
```

✅ **Backend déployé !** → `https://api.xamle.sn`

---

## 🌐 Partie 2 : Frontend sur Vercel (10 minutes)

### Étape 1 : Installer Vercel CLI

```bash
npm install -g vercel
vercel login
```

### Étape 2 : Configurer les Variables d'Environnement

Créez `frontend/.env.production` :

```bash
NEXT_PUBLIC_API_URL=https://api.xamle.sn/api/v1
NEXT_PUBLIC_WS_URL=wss://api.xamle.sn
NEXT_PUBLIC_APP_URL=https://xamle.sn
NEXT_PUBLIC_MEILISEARCH_URL=https://api.xamle.sn/search
NEXT_PUBLIC_STORAGE_URL=https://api.xamle.sn/storage
```

### Étape 3 : Déployer sur Vercel

```bash
# Depuis la racine du projet
vercel

# Suivre les instructions :
# ? Set up and deploy? Yes
# ? Which scope? Votre compte
# ? Link to existing project? No
# ? Project name? xamle-civic
# ? In which directory is your code? ./frontend
```

### Étape 4 : Configurer sur Vercel Dashboard

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez `xamle-civic`
3. **Settings** → **Environment Variables** → Ajoutez :

```
NEXT_PUBLIC_API_URL = https://api.xamle.sn/api/v1
NEXT_PUBLIC_WS_URL = wss://api.xamle.sn
NEXT_PUBLIC_APP_URL = https://xamle.sn
NEXT_PUBLIC_MEILISEARCH_URL = https://api.xamle.sn/search
NEXT_PUBLIC_STORAGE_URL = https://api.xamle.sn/storage
```

4. **Settings** → **Domains** → Ajoutez `xamle.sn`

### Étape 5 : Configurer DNS pour le Frontend

```
Type: CNAME
Nom: @
Valeur: cname.vercel-dns.com
TTL: 300

Type: CNAME
Nom: www
Valeur: cname.vercel-dns.com
TTL: 300
```

### Étape 6 : Redéployer

```bash
vercel --prod
```

✅ **Frontend déployé !** → `https://xamle.sn`

---

## 🔄 Mises à Jour

### Backend (VPS)

```bash
ssh xamle@votre-vps-ip
cd ~/xamle-civic
./scripts/deploy-vps.sh
```

### Frontend (Vercel)

```bash
# Automatique à chaque push sur main
git push origin main

# Ou manuel
vercel --prod
```

---

## 🛠️ Commandes Utiles

### Backend

```bash
# Logs
docker compose -f docker-compose.vps.yml logs -f

# Redémarrer un service
docker compose -f docker-compose.vps.yml restart api

# Statut
docker compose -f docker-compose.vps.yml ps

# Backup DB
docker compose -f docker-compose.vps.yml exec postgres pg_dump -U xamle_prod xamle_civic_prod > backup.sql
```

### Frontend

```bash
# Logs
vercel logs xamle-civic --follow

# Rollback
vercel rollback
```

---

## ✅ Checklist

### Backend
- [ ] VPS configuré
- [ ] DNS pointé vers VPS
- [ ] `.env.production` configuré
- [ ] SSL obtenu
- [ ] Services démarrés
- [ ] `https://api.xamle.sn/health` répond

### Frontend
- [ ] Variables d'environnement configurées
- [ ] Domaine ajouté sur Vercel
- [ ] DNS pointé vers Vercel
- [ ] `https://xamle.sn` accessible
- [ ] API calls fonctionnent

---

## 🚨 Problèmes Courants

### API ne répond pas
```bash
docker compose -f docker-compose.vps.yml logs api
docker compose -f docker-compose.vps.yml restart api
```

### SSL ne fonctionne pas
```bash
# Vérifier que le domaine pointe vers le VPS
dig api.xamle.sn

# Réessayer
./scripts/ssl-setup.sh
```

### Frontend ne peut pas joindre l'API
1. Vérifiez `CORS_ORIGINS` dans `.env.production` du backend
2. Vérifiez `NEXT_PUBLIC_API_URL` sur Vercel
3. Testez : `curl https://api.xamle.sn/health`

---

## 📞 Besoin d'Aide ?

Consultez le guide complet : [DEPLOIEMENT-COMPLET.md](./DEPLOIEMENT-COMPLET.md)

**Bon déploiement ! 🚀**
