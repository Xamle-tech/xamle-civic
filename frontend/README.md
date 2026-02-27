# Xamle Civic — Web (Frontend)

Application Next.js du projet Xamle Civic. Dépôt séparé pour déploiement autonome (Vercel).

## Installation

```bash
npm install
```

## Build des packages partagés (types + UI)

```bash
npm run build:packages
```

## Développement

```bash
npm run dev
```

Ouvre http://localhost:3001

## Production

```bash
npm run build
npm start
```

## Variables d'environnement

`NEXT_PUBLIC_API_URL` : URL de l'API (ex: https://api.xamle.sn)
`NEXT_PUBLIC_APP_URL` : URL du site (ex: https://xamle.sn)

## Déploiement Vercel

Connecter ce dépôt à Vercel. Root Directory : `.` (racine).
