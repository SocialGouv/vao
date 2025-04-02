ARG NODE_VERSION=22.13-bullseye-slim

FROM node:$NODE_VERSION AS cron-base

FROM cron-base AS cron-deps

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/cron/package.json ./packages/cron/
COPY packages/cron ./packages/cron
COPY packages/shared packages/shared
RUN yarn workspace @vao/cron install --frozen-lockfile

FROM cron-deps AS cron-production

RUN touch ./healthy

USER 1000
WORKDIR /app

COPY --chown=1000:1000 --from=cron-deps /app/node_modules ./node_modules
COPY package.json yarn.lock ./
COPY packages/cron/package.json ./packages/cron/
COPY packages/cron ./packages/cron
COPY packages/shared packages/shared

ENV NODE_ENV=production

CMD ["yarn", "workspace", "@vao/cron", "dev"]

