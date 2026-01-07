/**
 * Central lint-staged config for the whole monorepo.
 *
 * Goal:
 * - ESLint runs only on staged files.
 * - Typecheck runs once per affected package (not once per file).
 */

module.exports = {
  // frontend-usagers
  "packages/frontend-usagers/src/**/*.{js,ts,vue}": [
    "corepack pnpm --dir packages/frontend-usagers exec eslint --cache --fix --max-warnings=0",
  ],
  "packages/frontend-usagers/src/**/*.{ts,vue}": [
    "corepack pnpm --dir packages/frontend-usagers run typecheck:staged --",
  ],

  // frontend-bo
  "packages/frontend-bo/src/**/*.{js,ts,vue}": [
    "corepack pnpm --dir packages/frontend-bo exec eslint --cache --fix --max-warnings=0",
  ],
  "packages/frontend-bo/src/**/*.{ts,vue}": [
    "corepack pnpm --dir packages/frontend-bo run typecheck:staged --",
  ],
};
