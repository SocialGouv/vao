#!/bin/bash
corepack pnpm --filter @vao/external-api... install
exec corepack pnpm --filter @vao/external-api start:dev
