#!/bin/bash

corepack pnpm --filter @vao/frontend-usagers install
exec corepack pnpm --filter @vao/frontend-usagers dev
