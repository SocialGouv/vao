#!/bin/bash

rm -rf /app/packages/backend/node_modules
cp -r /usr/cache/packages/backend/node_modules /app/packages/backend/node_modules
cp -r /usr/cache/packages/backend/package.json /app/packages/backend/package.json
cp -r /usr/cache/packages/backend/yarn.lock /app/packages/backend/yarn.lock
exec yarn workspace @vao/backend dev