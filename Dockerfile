# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS base
# openssl is required by the Prisma schema engine (used by `prisma migrate deploy`)
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Placeholder so prisma.config.ts resolves during the build. The real value is
# supplied at runtime by docker-compose; nothing connects to it at build time.
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN npx prisma generate && npm run build

FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Keep the full app (incl. dev deps) so the container can also run
# `prisma migrate deploy`, the seed, and the tsx task-reminder script.
COPY --from=builder --chown=node:node /app ./
RUN mkdir -p /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 3000
# Apply any pending migrations, then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
