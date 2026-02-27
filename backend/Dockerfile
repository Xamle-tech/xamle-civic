# Backend Xamle Civic — standalone (dossier séparé)
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
