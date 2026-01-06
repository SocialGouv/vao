ARG NODE_VERSION=22.20.0-bullseye-slim
FROM node:$NODE_VERSION AS external-api-base

USER root

RUN apt-get update && apt-get install -y procps && apt-get clean

FROM external-api-base AS external-api-deps

WORKDIR /app

RUN corepack enable

# Non-interactive pnpm behavior during Docker builds
ENV CI=true

# cache keyed by lockfile/config
COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm fetch --prod --ignore-scripts

COPY package.json ./
COPY packages/external-api/package.json ./packages/external-api/
COPY packages/external-api/src ./packages/external-api/src
COPY packages/shared-bridge/package.json packages/shared-bridge/
RUN pnpm install --frozen-lockfile

FROM external-api-deps AS external-api-build

WORKDIR /app

COPY --from=external-api-deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/external-api/package.json ./packages/external-api/
COPY packages/external-api/ ./packages/external-api/
COPY packages/shared-bridge packages/shared-bridge
ENV NODE_ENV=production

RUN pnpm --filter @vao/external-api build

FROM external-api-base AS external-api-production

USER 1000
WORKDIR /app

COPY --chown=1000:1000 --from=external-api-build /app/node_modules ./node_modules
COPY --chown=1000:1000 --from=external-api-build /app/packages/external-api/node_modules ./packages/external-api/node_modules
COPY --chown=1000:1000 --from=external-api-build /app/packages/external-api/dist ./packages/external-api/dist

# Ensure workspace dependency symlinks (e.g. @vao/shared-bridge) can resolve at runtime
COPY --chown=1000:1000 --from=external-api-build /app/packages/shared-bridge ./packages/shared-bridge

ENV NODE_ENV=production

CMD [ "node", "/app/packages/external-api/dist/main.js" ]
