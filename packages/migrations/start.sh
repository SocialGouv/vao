#!/bin/bash
corepack pnpm --filter @vao/migrations... install
exec corepack pnpm --filter @vao/migrations exec knex --cwd ./src migrate:latest
