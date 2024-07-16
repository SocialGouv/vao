ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY package*.json yarn.lock ./
COPY packages/shared packages/shared/ 
COPY packages/frontend-usagers/package*.json packages/frontend-usagers/yarn.lock packages/frontend-usagers/
# RUN yarn workspace @vao/frontend-usagers install --frozen-lockfile

RUN yarn install

COPY packages/frontend-usagers .

# these variables are needed at build time because we produce a *static* app
ARG NUXT_PUBLIC_APP_VERSION=development
ARG NUXT_PUBLIC_BACKEND_URL
ARG NUXT_PUBLIC_ENVIRONMENT
ARG NUXT_PUBLIC_MATOMO_ENABLED
ARG NUXT_PUBLIC_MATOMO_HOST
ARG NUXT_PUBLIC_MATOMO_SITE_ID
ARG NUXT_PUBLIC_SENTRY_DSN
ARG NUXT_PUBLIC_SENTRY_ENABLED

ENV NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION
ENV NUXT_PUBLIC_BACKEND_URL=$NUXT_PUBLIC_BACKEND_URL
ENV NUXT_PUBLIC_ENVIRONMENT=$NUXT_PUBLIC_ENVIRONMENT
ENV NUXT_PUBLIC_MATOMO_ENABLED=$NUXT_PUBLIC_MATOMO_ENABLED
ENV NUXT_PUBLIC_MATOMO_HOST=$NUXT_PUBLIC_MATOMO_HOST
ENV NUXT_PUBLIC_MATOMO_SITE_ID=$NUXT_PUBLIC_MATOMO_SITE_ID
ENV NUXT_PUBLIC_SENTRY_DSN=$NUXT_PUBLIC_SENTRY_DSN
ENV NUXT_PUBLIC_SENTRY_ENABLED=$NUXT_PUBLIC_SENTRY_ENABLED

# replace environment variables

# RUN yarn workspace @vao/frontend-usagers generate
RUN yarn generate

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.3

COPY --from=builder --chown=101:101 /app/.output/public /usr/share/nginx/html