# ─── Build stage ─────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copy workspace config
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/types/package.json ./packages/types/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Generate Prisma client
RUN pnpm --filter @xamle/api exec prisma generate

# Build NestJS
RUN pnpm --filter @xamle/api build

# ─── Production stage ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs

# Install only prod deps
COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/packages/types/package.json ./packages/types/

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate && \
    pnpm install --frozen-lockfile --prod

COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nestjs

WORKDIR /app/apps/api
EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
