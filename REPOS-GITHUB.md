# Deux dépôts GitHub — Backend et Frontend

Ce document explique comment obtenir **deux dossiers autonomes** (backend et frontend) à partir du monorepo, puis les pousser vers **deux dépôts GitHub distincts**.

---

## 1. Générer les deux dossiers

À la **racine du monorepo** Xamle Civic :

```bash
node scripts/split-monorepo.js
```

Cela crée :

- **`backend/`** — API NestJS + package `packages/types` (copie locale)
- **`frontend/`** — Application Next.js + packages `packages/types` et `packages/ui` (copies locales)

Chaque dossier est **autonome** : son propre `package.json`, ses propres dépendances, pas de lien avec le monorepo.

---

## 2. Vérifier que tout compile

### Backend

```bash
cd backend
npm install
# ou : pnpm install

cd packages/types && npm run build && cd ../..
npm run build
```

### Frontend

```bash
cd frontend
npm install
# ou : pnpm install

npm run build:packages
npm run build
```

---

## 3. Créer les deux dépôts sur GitHub

1. Sur GitHub : **New repository**
2. Créer par exemple :
   - **xamle-civic-api** (backend)
   - **xamle-civic-web** (frontend)
3. Ne pas initialiser avec un README (tu vas pousser un dossier existant).

---

## 4. Pousser chaque dossier vers son dépôt

### Backend → `xamle-civic-api`

```bash
cd backend
git init
git add .
git commit -m "chore: extraction backend depuis monorepo"
git branch -M main
git remote add origin https://github.com/TON_ORG/xamle-civic-api.git
git push -u origin main
```

### Frontend → `xamle-civic-web`

```bash
cd frontend
git init
git add .
git commit -m "chore: extraction frontend depuis monorepo"
git branch -M main
git remote add origin https://github.com/TON_ORG/xamle-civic-web.git
git push -u origin main
```

Remplace `TON_ORG` par ton organisation ou ton compte GitHub.

---

## 5. Structure des dépôts

### Dépôt Backend (`xamle-civic-api`)

```
backend/
├── package.json          # @xamle/types → file:./packages/types
├── tsconfig.json
├── Dockerfile
├── README.md
├── src/                  # Code NestJS (ex-apps/api)
├── prisma/
└── packages/
    └── types/            # Copie de packages/types
```

### Dépôt Frontend (`xamle-civic-web`)

```
frontend/
├── package.json          # @xamle/types et @xamle/ui → file:./packages/*
├── tsconfig.json
├── next.config.js
├── README.md
├── app/
├── components/
├── lib/
├── messages/
└── packages/
    ├── types/            # Copie de packages/types
    └── ui/               # Copie de packages/ui
```

---

## 6. Synchroniser après des changements dans le monorepo

Quand tu modifies le monorepo et veux mettre à jour les deux dépôts :

1. Régénérer les dossiers :
   ```bash
   node scripts/split-monorepo.js
   ```
2. Dans `backend/` et `frontend/`, faire commit + push vers leurs dépôts respectifs :
   ```bash
   cd backend && git add . && git commit -m "sync: monorepo" && git push
   cd ../frontend && git add . && git commit -m "sync: monorepo" && git push
   ```

Tu peux aussi ajouter un script à la racine du monorepo, par exemple :

```json
"scripts": {
  "split": "node scripts/split-monorepo.js",
  "split:push": "node scripts/split-monorepo.js && cd backend && git add . && git diff --staged --quiet || (git commit -m 'sync: monorepo' && git push) && cd ../frontend && git add . && git diff --staged --quiet || (git commit -m 'sync: monorepo' && git push)"
}
```

---

## 7. Déploiement

- **Backend** : déployer le contenu de `backend/` (Docker, VPS, etc.) comme décrit dans `DEPLOYMENT.md`.
- **Frontend** : connecter le dépôt `xamle-civic-web` à Vercel (ou autre) et déployer.

Les variables d’environnement et la configuration (CORS, URLs) restent les mêmes que dans la doc de déploiement actuelle.

---

## 8. Résumé

| Étape | Commande / action |
|-------|-------------------|
| Générer les dossiers | `node scripts/split-monorepo.js` |
| Install + build backend | `cd backend && npm install && npm run build` |
| Install + build frontend | `cd frontend && npm install && npm run build:packages && npm run build` |
| Créer les repos GitHub | xamle-civic-api, xamle-civic-web |
| Pousser le backend | `cd backend && git init && ... && git push` |
| Pousser le frontend | `cd frontend && git init && ... && git push` |

Une fois ces étapes faites, tu as bien **deux répertoires distincts**, chacun poussé sur son propre dépôt GitHub.
