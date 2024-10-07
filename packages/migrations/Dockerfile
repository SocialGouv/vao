ARG NODE_VERSION=20-bullseye-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

COPY ./package.json ./yarn.lock ./
COPY packages/migrations/package.json packages/migrations/
RUN yarn workspace @vao/migrations install --frozen-lockfile

#--- Run stage
FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

ENV NODE_ENV: production

COPY --from=build /app/node_modules node_modules
COPY package.json yarn.lock ./
COPY packages/migrations/package.json packages/migrations/yarn.lock packages/migrations/
COPY packages/migrations/src packages/migrations/src

CMD ["./node_modules/.bin/knex", "--cwd", "packages/migrations/src", "migrate:latest"]


