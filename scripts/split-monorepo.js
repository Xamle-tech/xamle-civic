#!/usr/bin/env node

/**
 * Script pour générer deux dossiers autonomes (backend/ et frontend/)
 * à partir du monorepo, afin de les pousser vers deux dépôts GitHub distincts.
 *
 * Usage: node scripts/split-monorepo.js
 * Depuis la racine du projet Xamle Civic.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT, 'backend');
const FRONTEND_DIR = path.join(ROOT, 'frontend');

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true });
  }
}

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(src)) {
    console.warn(`Skip (missing): ${src}`);
    return;
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const e of entries) {
    const srcPath = path.join(src, e.name);
    const destPath = path.join(dest, e.name);
    if (exclude.includes(e.name)) continue;
    if (e.isDirectory()) {
      copyDir(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

console.log('Création des dossiers backend/ et frontend/...\n');

// ─── Nettoyer ─────────────────────────────────────────────────
rmDir(BACKEND_DIR);
rmDir(FRONTEND_DIR);

// ─── Backend ───────────────────────────────────────────────────
console.log('📦 Backend...');
copyDir(path.join(ROOT, 'apps/api'), BACKEND_DIR, ['node_modules', 'dist', 'coverage', '.env', '.env.local']);
copyDir(path.join(ROOT, 'packages/types'), path.join(BACKEND_DIR, 'packages/types'), ['node_modules']);

const backendPackageJson = {
  name: 'xamle-civic-api',
  version: '0.1.0',
  private: true,
  scripts: {
    build: 'npm run build:types && nest build',
    'build:types': 'cd packages/types && npm run build',
    dev: 'npm run build:types && nest start --watch',
    start: 'node dist/main',
    lint: 'eslint src --ext .ts',
    test: 'jest --passWithNoTests',
    'test:cov': 'jest --coverage',
    typecheck: 'tsc --noEmit',
    'db:migrate': 'prisma migrate dev',
    'db:migrate:deploy': 'prisma migrate deploy',
    'db:seed': 'ts-node prisma/seed.ts',
    'db:generate': 'prisma generate',
    'db:studio': 'prisma studio',
  },
  dependencies: {
    '@nestjs/common': '^10.4.15',
    '@nestjs/config': '^3.3.0',
    '@nestjs/core': '^10.4.15',
    '@nestjs/jwt': '^10.2.0',
    '@nestjs/mapped-types': '^2.0.6',
    '@nestjs/passport': '^10.0.3',
    '@nestjs/platform-express': '^10.4.15',
    '@nestjs/platform-socket.io': '^10.4.15',
    '@nestjs/schedule': '^4.1.2',
    '@nestjs/swagger': '^8.1.0',
    '@nestjs/throttler': '^6.3.0',
    '@nestjs/websockets': '^10.4.15',
    '@prisma/client': '^6.3.1',
    '@xamle/types': 'file:./packages/types',
    'bcryptjs': '^2.4.3',
    'class-transformer': '^0.5.1',
    'class-validator': '^0.14.1',
    'cookie-parser': '^1.4.7',
    'csrf-csrf': '^3.1.0',
    'helmet': '^8.0.0',
    'ioredis': '^5.4.2',
    'meilisearch': '^0.47.0',
    'minio': '^8.0.3',
    'multer': '^1.4.5-lts.1',
    'nodemailer': '^6.9.16',
    'passport': '^0.7.0',
    'passport-google-oauth20': '^2.0.0',
    'passport-jwt': '^4.0.1',
    'passport-local': '^1.0.0',
    'reflect-metadata': '^0.2.2',
    'rxjs': '^7.8.1',
    'slugify': '^1.6.6',
    'socket.io': '^4.8.1',
    'speakeasy': '^2.0.0',
    'uuid': '^11.0.5',
    'zod': '^3.24.1',
  },
  devDependencies: {
    '@nestjs/cli': '^10.4.9',
    '@nestjs/schematics': '^10.2.3',
    '@nestjs/testing': '^10.4.15',
    '@types/bcryptjs': '^2.4.6',
    '@types/cookie-parser': '^1.4.8',
    '@types/jest': '^29.5.14',
    '@types/multer': '^1.4.12',
    '@types/nodemailer': '^6.4.17',
    '@types/passport-google-oauth20': '^2.0.16',
    '@types/passport-jwt': '^4.0.1',
    '@types/passport-local': '^1.0.38',
    '@types/speakeasy': '^2.0.10',
    '@types/uuid': '^10.0.0',
    'jest': '^29.7.0',
    'prisma': '^6.3.1',
    'ts-jest': '^29.2.5',
    'ts-node': '^10.9.2',
    'typescript': '^5.7.3',
  },
  prisma: { seed: 'ts-node prisma/seed.ts' },
  jest: {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: 'src',
    testRegex: '.*\\.spec\\.ts$',
    transform: { '^.+\\.(t|j)s$': 'ts-jest' },
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
  },
};

writeFile(path.join(BACKEND_DIR, 'package.json'), JSON.stringify(backendPackageJson, null, 2));

const backendTsconfig = {
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    declaration: true,
    removeComments: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    allowSyntheticDefaultImports: true,
    target: 'ES2022',
    sourceMap: true,
    outDir: './dist',
    rootDir: './src',
    baseUrl: './',
    skipLibCheck: true,
    strictNullChecks: true,
    noImplicitAny: true,
    strictBindCallApply: true,
    forceConsistentCasingInFileNames: true,
    noFallthroughCasesInSwitch: true,
    paths: {
      '@xamle/types': ['./packages/types/dist/index'],
      '@xamle/types/*': ['./packages/types/dist/*'],
    },
  },
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist', 'prisma', '**/*.spec.ts'],
};

writeFile(path.join(BACKEND_DIR, 'tsconfig.json'), JSON.stringify(backendTsconfig, null, 2));

// Dockerfile backend standalone
const backendDockerfile = `# Backend Xamle Civic — standalone (dossier séparé)
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages/types/package.json ./packages/types/

RUN npm install

COPY packages/types ./packages/types
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json nest-cli.json ./

RUN cd packages/types && npm run build
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

COPY package.json package-lock.json* ./
COPY packages/types/package.json ./packages/types/
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
`;

writeFile(path.join(BACKEND_DIR, 'Dockerfile'), backendDockerfile);

// README backend
writeFile(
  path.join(BACKEND_DIR, 'README.md'),
  `# Xamle Civic — API (Backend)

API NestJS du projet Xamle Civic. Dépôt séparé pour déploiement autonome (VPS Docker).

## Installation

\`\`\`bash
npm install
\`\`\`

## Build des types partagés

\`\`\`bash
npm run build:types
\`\`\`

## Développement

\`\`\`bash
npm run dev
\`\`\`

## Production

\`\`\`bash
npm run build
npm run db:migrate:deploy
npm start
\`\`\`

## Variables d'environnement

Voir \`.env.example\` à la racine du monorepo (ou créer \`.env\` avec DATABASE_URL, REDIS_*, JWT_SECRET, etc.).

## Docker

\`\`\`bash
docker build -t xamle-api .
docker run -p 4000:4000 --env-file .env xamle-api
\`\`\`
`
);

// .gitignore backend
writeFile(
  path.join(BACKEND_DIR, '.gitignore'),
  `node_modules/
dist/
coverage/
.env
.env.local
.env.*.local
*.log
.DS_Store
`
);

// ─── Frontend ──────────────────────────────────────────────────
console.log('📦 Frontend...');
copyDir(path.join(ROOT, 'apps/web'), FRONTEND_DIR, ['node_modules', '.next', 'out', '.turbo', '.env', '.env.local']);
copyDir(path.join(ROOT, 'packages/types'), path.join(FRONTEND_DIR, 'packages/types'), ['node_modules']);
copyDir(path.join(ROOT, 'packages/ui'), path.join(FRONTEND_DIR, 'packages/ui'), ['node_modules']);

const frontendPackageJson = {
  name: 'xamle-civic-web',
  version: '0.1.0',
  private: true,
  scripts: {
    dev: 'next dev -p 3001',
    build: 'npm run build:packages && next build',
    'build:packages': 'npm run build:types && npm run build:ui',
    'build:types': 'cd packages/types && npm run build',
    'build:ui': 'cd packages/ui && npm run typecheck',
    start: 'next start -p 3000',
    lint: 'next lint',
    typecheck: 'tsc --noEmit',
    'test:e2e': 'playwright test',
    'test:e2e:ui': 'playwright test --ui',
    'test:e2e:headed': 'playwright test --headed',
    test: 'vitest run --passWithNoTests',
    'test:watch': 'vitest',
    'test:cov': 'vitest run --coverage',
  },
  dependencies: {
    '@hookform/resolvers': '^3.9.1',
    '@radix-ui/react-accordion': '^1.2.2',
    '@radix-ui/react-avatar': '^1.1.2',
    '@radix-ui/react-checkbox': '^1.1.3',
    '@radix-ui/react-dialog': '^1.1.4',
    '@radix-ui/react-dropdown-menu': '^2.1.4',
    '@radix-ui/react-label': '^2.1.1',
    '@radix-ui/react-popover': '^1.1.4',
    '@radix-ui/react-progress': '^1.1.1',
    '@radix-ui/react-select': '^2.1.4',
    '@radix-ui/react-separator': '^1.1.1',
    '@radix-ui/react-slot': '^1.1.1',
    '@radix-ui/react-switch': '^1.1.2',
    '@radix-ui/react-tabs': '^1.1.2',
    '@radix-ui/react-toast': '^1.2.4',
    '@radix-ui/react-tooltip': '^1.1.6',
    '@tanstack/react-query': '^5.66.0',
    '@tanstack/react-query-devtools': '^5.66.0',
    '@xamle/types': 'file:./packages/types',
    '@xamle/ui': 'file:./packages/ui',
    'class-variance-authority': '^0.7.1',
    'clsx': '^2.1.1',
    'd3': '^7.9.0',
    'framer-motion': '^11.18.2',
    'leaflet': '^1.9.4',
    'lucide-react': '^0.475.0',
    'next': '14.2.25',
    'next-intl': '^3.26.3',
    'next-pwa': '^5.6.0',
    'react': '^18.3.1',
    'react-dom': '^18.3.1',
    'react-hook-form': '^7.54.2',
    'react-leaflet': '^4.2.1',
    'recharts': '^2.15.0',
    'socket.io-client': '^4.8.1',
    'tailwind-merge': '^2.6.0',
    'zod': '^3.24.1',
    'zustand': '^4.5.6',
  },
  devDependencies: {
    '@playwright/test': '^1.58.2',
    '@testing-library/jest-dom': '^6.6.3',
    '@testing-library/react': '^16.2.0',
    '@testing-library/user-event': '^14.6.1',
    '@types/d3': '^7.4.3',
    '@types/leaflet': '^1.9.16',
    '@types/node': '^22.13.5',
    '@types/react': '^18.3.18',
    '@types/react-dom': '^18.3.5',
    '@vitejs/plugin-react': '^4.3.4',
    '@vitest/coverage-v8': '^3.0.5',
    'autoprefixer': '^10.4.20',
    'eslint': '^8.57.1',
    'eslint-config-next': '14.2.25',
    'jsdom': '^26.0.0',
    'postcss': '^8.5.1',
    'prettier-plugin-tailwindcss': '^0.6.11',
    'tailwindcss': '^3.4.17',
    'tailwindcss-animate': '^1.0.7',
    'typescript': '^5.7.3',
    'vitest': '^3.0.5',
  },
};

writeFile(path.join(FRONTEND_DIR, 'package.json'), JSON.stringify(frontendPackageJson, null, 2));

const frontendTsconfig = {
  compilerOptions: {
    target: 'ES2022',
    lib: ['dom', 'dom.iterable', 'ES2022'],
    allowJs: true,
    skipLibCheck: true,
    strict: true,
    noEmit: true,
    esModuleInterop: true,
    module: 'esnext',
    moduleResolution: 'bundler',
    resolveJsonModule: true,
    isolatedModules: true,
    jsx: 'preserve',
    incremental: true,
    plugins: [{ name: 'next' }],
    baseUrl: '.',
    paths: {
      '@/*': ['./*'],
      '@xamle/types': ['./packages/types/src/index.ts'],
      '@xamle/ui': ['./packages/ui/src/index.ts'],
    },
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules', 'e2e/**'],
};

writeFile(path.join(FRONTEND_DIR, 'tsconfig.json'), JSON.stringify(frontendTsconfig, null, 2));

// README frontend
writeFile(
  path.join(FRONTEND_DIR, 'README.md'),
  `# Xamle Civic — Web (Frontend)

Application Next.js du projet Xamle Civic. Dépôt séparé pour déploiement autonome (Vercel).

## Installation

\`\`\`bash
npm install
\`\`\`

## Build des packages partagés (types + UI)

\`\`\`bash
npm run build:packages
\`\`\`

## Développement

\`\`\`bash
npm run dev
\`\`\`

Ouvre http://localhost:3001

## Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Variables d'environnement

\`NEXT_PUBLIC_API_URL\` : URL de l'API (ex: https://api.xamle.sn)
\`NEXT_PUBLIC_APP_URL\` : URL du site (ex: https://xamle.sn)

## Déploiement Vercel

Connecter ce dépôt à Vercel. Root Directory : \`.\` (racine).
`
);

// .gitignore frontend
writeFile(
  path.join(FRONTEND_DIR, '.gitignore'),
  `node_modules/
.next/
out/
.vercel
.env
.env.local
.env.*.local
*.log
.DS_Store
coverage/
playwright-report/
test-results/
`
);

// Copier .env.example si présent
const envExample = path.join(ROOT, '.env.production.example');
if (fs.existsSync(envExample)) {
  fs.copyFileSync(envExample, path.join(BACKEND_DIR, '.env.example'));
}
const webEnvExample = path.join(ROOT, 'apps/web/.env.production.example');
if (fs.existsSync(webEnvExample)) {
  fs.copyFileSync(webEnvExample, path.join(FRONTEND_DIR, '.env.example'));
}

console.log('\n✅ Dossiers créés :');
console.log('   - backend/  (API NestJS + packages/types)');
console.log('   - frontend/ (Next.js + packages/types + packages/ui)');
console.log('\nProchaines étapes :');
console.log('   1. cd backend && npm install && npm run build:types && npm run build');
console.log('   2. cd frontend && npm install && npm run build:packages && npm run build');
console.log('   3. Créer deux dépôts GitHub et pousser chaque dossier (voir REPOS-GITHUB.md)');
console.log('');
