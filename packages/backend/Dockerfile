ARG NODE_VERSION=22.20.0-bullseye-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/
COPY packages/backend/tsconfig.json packages/backend/
COPY packages/backend/src packages/backend/src
COPY packages/shared-bridge packages/shared-bridge

RUN yarn workspace @vao/backend install --frozen-lockfile
RUN yarn workspace @vao/backend build
RUN yarn workspace @vao/shared-bridge build

#--- Run stage

FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

ENV NODE_ENV: production

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/backend/dist packages/backend/dist
COPY --from=build /app/packages/shared-bridge/dist/ packages/shared-bridge
COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/

CMD ["node", "packages/backend/dist/index.js"]
