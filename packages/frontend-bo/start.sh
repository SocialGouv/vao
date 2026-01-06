#!/bin/bash

corepack pnpm --filter @vao/frontend-bo install
exec corepack pnpm --filter @vao/frontend-bo dev
