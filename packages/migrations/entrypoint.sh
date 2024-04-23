#!/bin/bash

rm -rf /app/node_modules
cp -r /usr/cache/node_modules /app/node_modules
cp -r /usr/cache/package.json /app/package.json
cp -r /usr/cache/yarn.lock /app/yarn.lock
exec yarn run migrate:up