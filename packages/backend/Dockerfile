ARG NODE_VERSION=22.20.0-bullseye-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/
COPY packages/backend/tsconfig.json packages/backend/
COPY packages/backend/src packages/backend/src

RUN yarn workspace @vao/backend install --frozen-lockfile
RUN yarn workspace @vao/backend build

#--- Run stage

FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

ENV NODE_ENV: production

COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/backend/dist packages/backend/dist
COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/

CMD ["node", "packages/backend/dist/index.js"]
