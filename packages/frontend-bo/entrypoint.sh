
rm -rf /app/packages/frontend-bo/node_modules
cp -r /usr/cache/node_modules /app/node_modules
cp -r /usr/cache/packages/frontend-bo/node_modules /app/packages/frontend-bo/node_modules
cp -r /usr/cache/packages/frontend-bo/package*.json /app/packages/frontend-bo/package*.json
cp -r /usr/cache/packages/frontend-bo/yarn.lock /app/packages/frontend-bo/yarn.lock
cp -r /usr/cache/packages/frontend-bo/.nuxt /app/packages/frontend-bo/.nuxt
exec yarn workspace @vao/frontend-bo dev