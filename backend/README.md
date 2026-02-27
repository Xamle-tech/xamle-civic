# Xamle Civic — API (Backend)

API NestJS du projet Xamle Civic. Dépôt séparé pour déploiement autonome (VPS Docker).

## Installation

```bash
npm install
```

## Build des types partagés

```bash
npm run build:types
```

## Développement

```bash
npm run dev
```

## Production

```bash
npm run build
npm run db:migrate:deploy
npm start
```

## Variables d'environnement

Voir `.env.example` à la racine du monorepo (ou créer `.env` avec DATABASE_URL, REDIS_*, JWT_SECRET, etc.).

## Docker

```bash
docker build -t xamle-api .
docker run -p 4000:4000 --env-file .env xamle-api
```
