#!/bin/bash

corepack pnpm --filter @vao/migrations install
exec corepack pnpm --filter @vao/migrations run knex --cwd ./src migrate:latest
