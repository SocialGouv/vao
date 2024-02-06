ARG NODE_VERSION=20-bullseye-slim
FROM node:${NODE_VERSION} AS deps

WORKDIR /app

COPY ./packages/backend/package.json ./packages/backend/yarn.lock ./
RUN yarn --frozen-lockfile

COPY ./packages/backend .

RUN yarn build && yarn install --production && yarn cache clean

#--- Run stage
FROM node:$NODE_VERSION

USER 1000
WORKDIR /app

COPY --from=build /app/ /app/

# Note: Don't use "yarn start" as it doesn't handle linux signals (graceful shutdown for instance)
CMD ["node", "dist/app.js"]


