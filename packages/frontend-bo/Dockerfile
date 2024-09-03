ARG NODE_VERSION=20.15.1-bullseye-slim
FROM node:${NODE_VERSION} AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && apt-get clean

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/ 
COPY packages/frontend-bo/package.json packages/frontend-bo/yarn.lock packages/frontend-bo/
RUN yarn workspace @vao/frontend-bo install --frozen-lockfile

# Sentry variables are needed at build time to upload sourcemaps
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_URL
ARG SENTRY_RELEASE                                                   

# Cannot be changed at runtime
ENV SENTRY_RELEASE=$SENTRY_RELEASE
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_URL=$SENTRY_URL

COPY packages/shared packages/shared
COPY packages/frontend-bo packages/frontend-bo

RUN --mount=type=secret,id=sentry_auth_token \
    export SENTRY_AUTH_TOKEN=$(cat /kaniko/sentry_auth_token) \ 
    && yarn workspace @vao/frontend-bo generate


FROM ghcr.io/dnum-socialgouv/docker-images/nginx4spa:sha-5389949

COPY --chmod=755 packages/frontend-bo/100-start-prod.sh /docker-entrypoint.d/100-start-prod.sh
COPY --from=builder --chown=101:101 /app/packages/frontend-bo/.output/public /app
