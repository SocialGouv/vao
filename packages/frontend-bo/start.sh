#!/bin/bash
corepack enable
corepack pnpm --filter @vao/frontend-bo install
exec corepack pnpm --filter @vao/frontend-bo dev
