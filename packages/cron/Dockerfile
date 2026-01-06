ARG NODE_VERSION=22.20.0-bullseye-slim

FROM node:$NODE_VERSION AS cron-base

FROM cron-base AS cron-deps

WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/cron/package.json ./packages/cron/
COPY packages/shared-bridge/package.json packages/shared-bridge/

RUN pnpm fetch --prod

COPY package.json ./
COPY packages/cron/package.json ./packages/cron/
COPY packages/cron ./packages/cron
COPY packages/shared-bridge packages/shared-bridge
RUN pnpm install --frozen-lockfile

FROM cron-deps AS cron-production

RUN touch ./healthy

USER 1000
WORKDIR /app

COPY --chown=1000:1000 --from=cron-deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/cron/package.json ./packages/cron/
COPY packages/cron ./packages/cron
COPY packages/shared-bridge packages/shared-bridge

ENV NODE_ENV=production

CMD ["pnpm", "--filter", "@vao/cron", "dev"]
