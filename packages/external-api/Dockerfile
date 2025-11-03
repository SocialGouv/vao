ARG NODE_VERSION=22.20.0-bullseye-slim
FROM node:$NODE_VERSION AS external-api-base

USER root

RUN apt-get update && apt-get install -y procps && apt-get clean

FROM external-api-base AS external-api-deps

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/external-api/package.json ./packages/external-api/
COPY packages/external-api/src ./packages/external-api/src
COPY packages/shared packages/shared
RUN yarn workspace @vao/external-api install --frozen-lockfile

FROM external-api-deps AS external-api-build

WORKDIR /app

COPY --from=external-api-deps /app/node_modules ./node_modules
COPY package.json yarn.lock ./
COPY packages/external-api/package.json ./packages/external-api/
COPY packages/external-api/ ./packages/external-api/
COPY packages/shared packages/shared

ENV NODE_ENV=production

RUN yarn workspace @vao/external-api build

FROM external-api-base AS external-api-production

USER 1000
WORKDIR /app

COPY --chown=1000:1000 --from=external-api-build /app/node_modules ./node_modules
COPY --chown=1000:1000 --from=external-api-build /app/packages/external-api/dist ./packages/external-api/dist

ENV NODE_ENV=production

CMD [ "node", "/app/packages/external-api/dist/main.js" ]
