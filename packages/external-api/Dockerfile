FROM node:22.13-bullseye-slim

# Installer procps
RUN apt-get update && apt-get install -y procps && apt-get clean

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers nécessaires (ajustez si besoin)
COPY package.json yarn.lock ./
COPY packages/external-api/package.json ./packages/external-api/
COPY packages/external-api/src ./packages/external-api/src
COPY packages/shared packages/shared

RUN yarn workspace @vao/external-api install --frozen-lockfile

# Commande par défaut
CMD ["yarn", "workspace", "@vao/external-api", "start:dev"]
