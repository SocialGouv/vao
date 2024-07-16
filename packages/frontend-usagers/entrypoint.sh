#!/bin/bash

rm -rf /app/packages/frontend-usagers/node_modules
cp -r /usr/cache/frontend-usagers/node_modules /app/packages/frontend-usagers/node_modules
cp -r /usr/cache/frontend-usagers/package*.json /app/packages/frontend-usagers/package*.json
cp -r /usr/cache/frontend-usagers/yarn.lock /app/packages/frontend-usagers/yarn.lock
exec yarn workspace @vao/frontend-usagers dev