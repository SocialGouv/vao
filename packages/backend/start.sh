#!/bin/bash
corepack pnpm --filter @vao/backend... install
exec corepack pnpm --filter @vao/backend dev
