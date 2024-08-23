ARG NODE_VERSION=20.15.1-bullseye-slim
FROM node:${NODE_VERSION} AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && apt-get clean

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/ 
COPY packages/frontend-usagers/package.json packages/frontend-usagers/yarn.lock packages/frontend-usagers/
RUN yarn workspace @vao/frontend-usagers install --frozen-lockfile

# Sentry variables are needed at build time to upload sourcemaps
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_URL
ARG SENTRY_AUTH_TOKEN

# Cannot be changed at runtime
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_URL=$SENTRY_URL

COPY packages/shared packages/shared
COPY packages/frontend-usagers packages/frontend-usagers

RUN yarn workspace @vao/frontend-usagers generate


FROM ghcr.io/dnum-socialgouv/docker-images/nginx4spa:sha-5389949

COPY --chmod=755 100-start-prod.sh /docker-entrypoint.d/100-start-prod.sh
COPY --from=builder --chown=101:101 /app/packages/frontend-usagers/.output/public /app
