ARG NODE_VERSION=22.20.0-bullseye-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

RUN corepack enable

# Non-interactive pnpm behavior during Docker builds
ENV CI=true

COPY pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

RUN pnpm fetch --prod --ignore-scripts

COPY package.json ./
COPY packages/backend/package.json packages/backend/
COPY packages/backend/tsconfig.json packages/backend/
COPY packages/backend/src packages/backend/src
COPY packages/shared-bridge packages/shared-bridge

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @vao/backend build
RUN pnpm --filter @vao/shared-bridge build

#--- Run stage

FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/backend/dist packages/backend/dist
COPY --from=build /app/packages/shared-bridge/dist/ packages/shared-bridge
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/backend/package.json packages/backend/
COPY packages/backend/assets packages/backend/assets

CMD ["node", "packages/backend/dist/index.js"]
