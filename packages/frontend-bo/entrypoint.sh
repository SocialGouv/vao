#!/bin/bash

rm -rf /app/packages/frontend-bo/node_modules
cp -r /usr/cache/node_modules /app/packages/frontend-bo/node_modules
cp -r /usr/cache/package.json /app/packages/frontend-bo/package.json
cp -r /usr/cache/yarn.lock /app/packages/frontend-bo/yarn.lock
exec yarn workspace @vao/frontend-bo dev