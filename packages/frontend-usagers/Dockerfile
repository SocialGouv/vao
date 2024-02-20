ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY ./package.json ./yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .

# these variables are needed at build time because we produce a *static* app
ARG NUXT_PUBLIC_BACKEND_URL
ARG NUXT_PUBLIC_SENTRY_DSN

ENV NUXT_PUBLIC_BACKEND_URL=$NUXT_PUBLIC_BACKEND_URL
ENV NUXT_PUBLIC_SENTRY_DSN=$NUXT_PUBLIC_SENTRY_DSN

# replace environment variables

RUN yarn generate

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.3

COPY --from=builder --chown=101:101 /app/.output/public /usr/share/nginx/html