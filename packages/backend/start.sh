#!/bin/bash
corepack enable
corepack pnpm --filter @vao/backend install
exec corepack pnpm --filter @vao/backend dev
