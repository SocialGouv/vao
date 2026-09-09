ARG NODE_VERSION=24.20.0-bookworm-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

RUN corepack enable

# Non-interactive pnpm behavior during Docker builds
ENV CI=true
ENV COREPACK_DEFAULT_TO_LATEST=0

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
RUN corepack prepare --activate
RUN pnpm fetch --prod --ignore-scripts

COPY packages/backend/package.json packages/backend/
COPY packages/backend/tsconfig.build.json packages/backend/tsconfig.build.json
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
COPY --from=build /app/packages/backend/node_modules packages/backend/node_modules
COPY --from=build /app/packages/shared-bridge/node_modules packages/shared-bridge/node_modules
COPY --from=build /app/packages/backend/dist packages/backend/dist
COPY --from=build /app/packages/shared-bridge/dist/ packages/shared-bridge
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/backend/package.json packages/backend/
COPY packages/backend/assets packages/backend/assets

CMD ["node", "packages/backend/dist/index.js"]
