#!/bin/bash

rm -rf /app/packages/frontend-usagers/node_modules
cp -r /usr/cache/packages/frontend-usagers/node_modules /app/packages/frontend-usagers/node_modules
cp -r /usr/cache/packages/frontend-usagers/package*.json /app/packages/frontend-usagers/package*.json
cp -r /usr/cache/packages/frontend-usagers/yarn.lock /app/packages/frontend-usagers/yarn.lock
exec yarn workspace @vao/frontend-usagers dev