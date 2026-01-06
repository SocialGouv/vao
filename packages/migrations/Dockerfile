ARG NODE_VERSION=22.20.0-bullseye-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY packages/migrations/package.json packages/migrations/
COPY packages/shared-bridge/package.json packages/shared-bridge/

# prefetch to leverage cache
RUN pnpm fetch --prod

RUN pnpm install --frozen-lockfile

#--- Run stage
FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

ENV NODE_ENV: production

COPY --from=build /app/node_modules node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/migrations/package.json packages/migrations/
COPY packages/migrations/src packages/migrations/src

COPY packages/shared-bridge/package.json packages/shared-bridge/

CMD ["./node_modules/.bin/knex", "--cwd", "packages/migrations/src", "migrate:latest"]
