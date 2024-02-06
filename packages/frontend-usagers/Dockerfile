ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS deps

# RUN apt-get update -y && apt-get install gettext-base && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
RUN yarn fetch workspaces focus @vao/frontend-usagers

# FROM deps AS builder-common
# COPY ./packages/common ./packages/common
# RUN yarn workspace @domifa/common build

FROM deps AS builder
# COPY --from=builder-common /app/packages/common ./packages/common

COPY ./packages/frontend-usagers ./packages/frontend-usagers

# these variables are needed at build time because we produce a *static* app
ARG VAO_BACKEND_URL
ARG VAO_ENV_ID
ARG VAO_SENTRY_DSN_FRONTEND

ENV VAO_BACKEND_URL=$VAO_BACKEND_URL
ENV VAO_ENV_ID=$VAO_ENV_ID
ENV VAO_SENTRY_DSN_FRONTEND=$VAO_SENTRY_DSN_FRONTEND

# replace environment variables
RUN envsubst < ./packages/frontend-usagers/src/environments/environment.prod.ts > ./packages/frontend-usagers/src/environments/environment.prod-env.ts
RUN mv ./packages/frontend-usagers/src/environments/environment.prod-env.ts ./packages/frontend-usagers/src/environments/environment.prod.ts

RUN yarn workspace @vao/frontend-usagers build

RUN yarn workspaces focus @vao/frontend-usagers --production && yarn cache clean

FROM ghcr.io/socialgouv/docker/nginx4spa:8.2.3

COPY --from=builder --chown=101:101 /app/packages/frontend-usagers/dist/vao-frontend-usagers /usr/share/nginx/html
