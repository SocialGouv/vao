ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS deps

# RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @vao/frontend-bo

FROM deps AS builder

COPY ./packages/frontend-bo ./packages/frontend-bo

# these variables are needed at build time because we produce a *static* app
ARG VAO_BACKEND_URL
ARG VAO_ENV_ID
ARG VAO_SENTRY_DSN_FRONTEND

ENV VAO_BACKEND_URL=$VAO_BACKEND_URL
ENV VAO_ENV_ID=$VAO_ENV_ID
ENV VAO_SENTRY_DSN_FRONTEND=$VAO_SENTRY_DSN_FRONTEND

# replace environment variables

RUN yarn workspace @vao/frontend-bo build

RUN yarn workspaces focus @vao/frontend-bo --production && yarn cache clean

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.3

COPY --from=builder --chown=101:101 /app/packages/frontend-bo/dist/vao-frontend-bo /usr/share/nginx/html



