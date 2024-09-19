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

COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/src /app/src

# Note: Don't use "yarn start" as it doesn't handle linux signals (graceful shutdown for instance)
CMD ["yarn", "workspace", "@vao/migrations", "run", "knex", "--cwd", "./src", "migrate:latest"]


