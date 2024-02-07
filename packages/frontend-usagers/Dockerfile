ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS builder

WORKDIR /app

COPY ./package.json ./yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .

# these variables are needed at build time because we produce a *static* app
ARG BACKEND_URL
ARG FRONTEND_USAGERS_SENTRY_DSN

ENV BACKEND_URL=$BACKEND_URL
ENV FRONTEND_USAGERS_SENTRY_DSN=$FRONTEND_USAGERS_SENTRY_DSN

# replace environment variables

RUN yarn generate

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.3

COPY --from=builder --chown=101:101 /app/.output/public /usr/share/nginx/html