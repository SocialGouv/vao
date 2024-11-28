ARG NODE_VERSION=20-bullseye-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/
RUN yarn workspace @vao/backend install --frozen-lockfile --production

#--- Run stage

FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

ENV NODE_ENV: production

COPY --from=build /app/node_modules node_modules
COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/
COPY packages/backend/src packages/backend/src

CMD ["node", "packages/backend/src/index.js"]


