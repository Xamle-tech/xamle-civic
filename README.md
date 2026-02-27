# Xamle Civic

Plateforme sénégalaise de transparence et participation citoyenne pour le suivi des politiques publiques.

---

## Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Variables d'environnement](#variables-denvironnement)
- [Structure du projet](#structure-du-projet)
- [Base de données](#base-de-données)
- [Déploiement](#déploiement)
- [Tests](#tests)
- [Comptes de démonstration](#comptes-de-démonstration)

---

## Architecture

```
xamle-civic/
├── apps/
│   ├── web/          # Next.js 14 — App Router, TypeScript, Tailwind
│   └── api/          # NestJS 10 — REST API, WebSockets, Prisma
├── packages/
│   ├── ui/           # Design system partagé (shadcn/ui + Tailwind)
│   └── types/        # Types TypeScript partagés + schémas Zod
├── docker-compose.yml            # Développement
├── docker-compose.prod.yml       # Production
├── nginx/                        # Configuration Nginx
└── .github/workflows/ci-cd.yml  # Pipeline CI/CD
```

**Stack technique:**

| Couche | Technologies |
|--------|-------------|
| Frontend | Next.js 14, TypeScript 5, Tailwind CSS 3, shadcn/ui, Framer Motion, TanStack Query v5, Zustand 4 |
| Backend | NestJS 10, Prisma ORM 6, PostgreSQL 16, Redis 7 |
| Recherche | Meilisearch v1.7 |
| Médias | MinIO (compatible S3) |
| CMS | Strapi 5 |
| Temps réel | Socket.io |
| Infrastructure | Docker, Nginx, GitHub Actions |
| Monitoring | Uptime Kuma, Sentry |

---

## Prérequis

- **Node.js** 20 LTS
- **pnpm** 10+
- **Docker** + **Docker Compose**
- **Git**

```bash
# Vérifier les versions
node --version    # >= 20.0.0
pnpm --version    # >= 10.0.0
docker --version  # >= 24.0.0
```

---

## Installation locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/xamle-civic/platform.git
cd platform
```

### 2. Variables d'environnement

```bash
cp .env.example .env
# Éditez .env avec vos valeurs
```

### 3. Démarrer les services Docker

```bash
pnpm docker:dev
# PostgreSQL, Redis, Meilisearch, MinIO, Strapi, Nginx, Uptime Kuma
```

Attendre que tous les services soient healthy (~30 secondes).

### 4. Installer les dépendances

```bash
pnpm install
```

### 5. Initialiser la base de données

```bash
pnpm --filter @xamle/api exec prisma migrate dev --name init
pnpm --filter @xamle/api db:seed
```

### 6. Démarrer en développement

```bash
pnpm dev
# API:  http://localhost:4000
# Web:  http://localhost:3000
# Docs: http://localhost:4000/api/docs
```

---

## Variables d'environnement

Toutes les variables requises sont documentées dans [`.env.example`](.env.example).

Variables critiques à configurer :

| Variable | Description | Requis en prod |
|----------|-------------|:--------------:|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_ACCESS_SECRET` | Secret JWT (min 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | Secret refresh token | ✅ |
| `REDIS_PASSWORD` | Mot de passe Redis | ✅ |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | Credentials MinIO | ✅ |
| `MEILISEARCH_MASTER_KEY` | Clé Meilisearch | ✅ |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth2 Google | ⚠️ |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Email (Nodemailer) | ⚠️ |
| `SENTRY_DSN_API` | Sentry monitoring API | ⚠️ |

---

## Structure du projet

### Frontend (`apps/web`)

```
app/
├── (public)/
│   ├── page.tsx                  # Landing page
│   ├── policies/page.tsx         # Liste des politiques
│   └── policies/[slug]/page.tsx  # Fiche détaillée
├── (dashboard)/
│   └── overview/page.tsx         # Tableau de bord citoyen
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
└── (admin)/                      # Interface d'administration

components/
├── features/                     # Composants métier
├── charts/                       # Recharts + D3
├── maps/                         # React-Leaflet
└── ui/                           # shadcn/ui primitives

stores/
├── filterStore.ts                # Zustand — filtres politiques
└── userStore.ts                  # Zustand — session utilisateur

messages/
├── fr.json                       # Traductions françaises
└── wo.json                       # Traductions wolof (en cours)
```

### Backend (`apps/api`)

```
src/
├── modules/
│   ├── auth/         # JWT + OAuth2 Google + OTP SMS
│   ├── policies/     # CRUD + status transitions + versions
│   ├── ministries/   # CRUD + classement performance
│   ├── contributions/ # Upload + modération 2 étapes
│   ├── comments/     # Commentaires threadés + votes
│   ├── search/       # Meilisearch full-text
│   ├── notifications/ # Email + SMS + in-app
│   ├── admin/        # Métriques + audit logs
│   └── realtime/     # Socket.io gateway
├── common/
│   ├── guards/       # JwtAuthGuard, RolesGuard
│   ├── interceptors/ # TransformInterceptor
│   ├── decorators/   # @CurrentUser, @Roles
│   └── filters/      # AllExceptionsFilter
└── config/           # Prisma, Redis modules
```

---

## Base de données

### Modèles principaux

| Modèle | Description |
|--------|-------------|
| `Ministry` | Ministères sénégalais |
| `Policy` | Politiques publiques avec versioning |
| `PolicyVersion` | Snapshots immuables à chaque modification |
| `StatusHistory` | Historique des changements de statut (append-only) |
| `Indicator` | Indicateurs de performance mesurés |
| `Source` | Sources vérifiables liées aux données |
| `User` | Utilisateurs avec rôles et gamification |
| `Contribution` | Contributions citoyennes avec workflow modération |
| `Comment` | Commentaires threadés |
| `Vote` | Votes sur politiques/contributions/commentaires |
| `Subscription` | Abonnements notifications |
| `AuditLog` | Journal immuable de toutes les actions |

### Commandes utiles

```bash
# Créer une migration
pnpm --filter @xamle/api exec prisma migrate dev --name nom_migration

# Appliquer en production
pnpm --filter @xamle/api exec prisma migrate deploy

# Interface graphique
pnpm db:studio

# Réinitialiser (⚠️ efface toutes les données)
pnpm --filter @xamle/api exec prisma migrate reset
```

---

## Déploiement

### Prérequis VPS

- Ubuntu 22.04 LTS
- Docker + Docker Compose
- Ports 80, 443 ouverts
- DNS pointant vers le VPS

### Déploiement initial

```bash
# Sur le VPS
git clone https://github.com/xamle-civic/platform.git /opt/xamle-civic
cd /opt/xamle-civic
cp .env.example .env
# Éditer .env avec les valeurs de production

# Obtenir un certificat SSL
docker compose -f docker-compose.prod.yml run --rm certbot

# Démarrer
docker compose -f docker-compose.prod.yml up -d
```

### Déploiement automatique (CI/CD)

Chaque push sur `main` déclenche automatiquement :
1. Lint + type-check
2. Tests unitaires (Vitest + Jest)
3. Tests E2E (Playwright)
4. Build Turborepo
5. Build et push des images Docker vers GHCR
6. Déploiement SSH sur VPS

**Secrets GitHub requis :**
- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`
- `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WS_URL`, `NEXT_PUBLIC_APP_URL`
- `CODECOV_TOKEN` (optionnel)

---

## Tests

```bash
# Tests unitaires
pnpm test

# Tests avec couverture
pnpm --filter @xamle/web test:cov
pnpm --filter @xamle/api test:cov

# Tests E2E
pnpm --filter @xamle/web exec playwright test

# Rapport de couverture
open apps/web/coverage/index.html
open apps/api/coverage/index.html
```

**Objectif de couverture : > 70%**

---

## Comptes de démonstration

Après `pnpm db:seed` :

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@xamle.sn` | `Admin@1234` | Super Admin |
| `moderateur@xamle.sn` | `Admin@1234` | Modérateur |
| `editeur@xamle.sn` | `Admin@1234` | Éditeur |
| `citoyen@example.sn` | `Admin@1234` | Contributeur |

---

## Services disponibles

| Service | URL (dev) | Description |
|---------|-----------|-------------|
| Web (Next.js) | http://localhost:3000 | Frontend citoyen |
| API (NestJS) | http://localhost:4000 | REST API |
| Swagger | http://localhost:4000/api/docs | Documentation API |
| Meilisearch | http://localhost:7700 | Moteur de recherche |
| MinIO Console | http://localhost:9001 | Gestion fichiers |
| Strapi CMS | http://localhost:1337 | Interface éditoriale |
| Uptime Kuma | http://localhost:3001 | Monitoring |
| Storybook | http://localhost:6006 | Design system |

---

## Licence

MIT — Xamle Civic © 2025
