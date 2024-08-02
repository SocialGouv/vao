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
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ARG SENTRY_URL
ARG SENTRY_AUTH_TOKEN

ENV NUXT_PUBLIC_APP_VERSION=$NUXT_PUBLIC_APP_VERSION
ENV NUXT_PUBLIC_BACKEND_URL=$NUXT_PUBLIC_BACKEND_URL
ENV NUXT_PUBLIC_ENVIRONMENT=$NUXT_PUBLIC_ENVIRONMENT
ENV NUXT_PUBLIC_MATOMO_ENABLED=$NUXT_PUBLIC_MATOMO_ENABLED
ENV NUXT_PUBLIC_MATOMO_HOST=$NUXT_PUBLIC_MATOMO_HOST
ENV NUXT_PUBLIC_MATOMO_SITE_ID=$NUXT_PUBLIC_MATOMO_SITE_ID
ENV NUXT_PUBLIC_SENTRY_DSN=$NUXT_PUBLIC_SENTRY_DSN
ENV NUXT_PUBLIC_SENTRY_RELEASE=$NUXT_PUBLIC_SENTRY_RELEASE
ENV NUXT_PUBLIC_SENTRY_ENABLED=$NUXT_PUBLIC_SENTRY_ENABLED
ENV SENTRY_RELEASE=$NUXT_PUBLIC_SENTRY_RELEASE
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
ENV SENTRY_URL=$SENTRY_URL

COPY packages/shared packages/shared
COPY packages/frontend-usagers packages/frontend-usagers

RUN yarn workspace @vao/frontend-usagers generate


FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY packages/frontend-usagers/nginx.conf /etc/nginx/

USER 0
RUN chown -R nginx:nginx /usr/share/nginx/html && chmod -R 755 /usr/share/nginx/html \
    && chown -R nginx:nginx /etc/nginx

USER 101

CMD ["nginx", "-g", "daemon off;"]

COPY --from=builder --chown=101:101 /app/packages/frontend-usagers/.output/public /usr/share/nginx/html