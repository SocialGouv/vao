ARG NODE_VERSION=20-bullseye-slim
FROM node:$NODE_VERSION AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY packages/backend/package.json packages/backend/yarn.lock packages/backend/
RUN yarn workspace @vao/backend install --frozen-lockfile --production

#--- Run stage

FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

ENV NODE_ENV: production

COPY --from=build /app/package.json /app/yarn.lock ./
COPY --from=build /app/node_modules node_modules
COPY --from=build /app/packages/backend/package.json /app/packages/backend/yarn.lock packages/backend/
COPY --from=build /app/packages/backend/node_modules packages/backend/node_modules
COPY packages/backend/src packages/backend/src

# Note: Don't use "yarn start" as it doesn't handle linux signals (graceful shutdown for instance)
CMD ["node", "packages/backend/src/index.js"]


