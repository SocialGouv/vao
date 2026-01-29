ARG NODE_VERSION=22.20.0-bullseye-slim
FROM node:${NODE_VERSION} AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && apt-get clean

WORKDIR /app

# pnpm via corepack (respect root packageManager)
RUN corepack enable

# Non-interactive pnpm behavior during Docker builds
ENV CI=true

# --- deps fetch layer (cache keyed by lockfile + config only)
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN pnpm fetch --prod --ignore-scripts

# --- install layer (package.json changes should not bust fetch cache)
COPY package.json ./
COPY packages/shared-bridge/package.json packages/shared-bridge/
COPY packages/shared-ui/package.json packages/shared-ui/
COPY packages/frontend-usagers/package.json packages/frontend-usagers/
RUN pnpm install --frozen-lockfile

# these variables are needed at build time because we produce a *static* app
ARG NUXT_PUBLIC_APP_VERSION=development
ARG NUXT_PUBLIC_BACKEND_URL
ARG NUXT_PUBLIC_ENVIRONMENT
ARG NUXT_PUBLIC_MATOMO_ENABLED
ARG NUXT_PUBLIC_MATOMO_HOST
ARG NUXT_PUBLIC_MATOMO_SITE_ID
ARG NUXT_PUBLIC_SENTRY_DSN
ARG NUXT_PUBLIC_SENTRY_RELEASE
ARG NUXT_PUBLIC_SENTRY_ENABLED
ARG NUXT_PUBLIC_API_MAP_TILER
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_URL

ENV NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION
ENV NUXT_PUBLIC_BACKEND_URL=$NUXT_PUBLIC_BACKEND_URL
ENV NUXT_PUBLIC_ENVIRONMENT=$NUXT_PUBLIC_ENVIRONMENT
ENV NUXT_PUBLIC_MATOMO_ENABLED=$NUXT_PUBLIC_MATOMO_ENABLED
ENV NUXT_PUBLIC_MATOMO_HOST=$NUXT_PUBLIC_MATOMO_HOST
ENV NUXT_PUBLIC_MATOMO_SITE_ID=$NUXT_PUBLIC_MATOMO_SITE_ID
ENV NUXT_PUBLIC_SENTRY_DSN=$NUXT_PUBLIC_SENTRY_DSN
ENV NUXT_PUBLIC_SENTRY_RELEASE=$NUXT_PUBLIC_SENTRY_RELEASE
ENV NUXT_PUBLIC_SENTRY_ENABLED=$NUXT_PUBLIC_SENTRY_ENABLED
ENV NUXT_PUBLIC_API_MAP_TILER=$NUXT_PUBLIC_API_MAP_TILER
ENV SENTRY_RELEASE=$NUXT_PUBLIC_SENTRY_RELEASE
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_URL=$SENTRY_URL

COPY packages/shared-bridge packages/shared-bridge
COPY packages/shared-ui packages/shared-ui
COPY packages/frontend-usagers packages/frontend-usagers

RUN --mount=type=secret,id=sentry_auth_token \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/sentry_auth_token) \
    && pnpm --filter @vao/frontend-usagers generate


FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.4

COPY --from=builder --chown=101:101 /app/packages/frontend-usagers/.output/public /usr/share/nginx/html
