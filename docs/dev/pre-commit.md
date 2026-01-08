# Pre-commit checks (husky + lint-staged)

The pre-commit hook is implemented in [`.husky/pre-commit`](../../.husky/pre-commit:1).

## What is checked

On commit, we run (only for **staged** files):

- ESLint (with `--fix`)
- Typecheck (staged-aware)

The central configuration is in [`lint-staged.config.cjs`](../../lint-staged.config.cjs:1).

## Why a typecheck in pre-commit

Some errors are not reliably caught by ESLint in a Nuxt app (eg invalid named imports from `#imports`).
Typechecking catches those and will block the commit.

The typecheck is implemented by [`scripts/typecheck-staged.cjs`](../../scripts/typecheck-staged.cjs:1): it runs `vue-tsc --noEmit` and only fails if the reported errors are located in staged files.

## Debugging

Run lint-staged in debug mode:

```sh
corepack pnpm exec lint-staged --config lint-staged.config.cjs --debug
```

## pnpm workspace filtering note (Docker dev)

If you run `pnpm install` with a `--filter` on a workspace, you often also want its workspace dependencies.
pnpm supports this via the trailing `...` syntax:

```sh
corepack pnpm --filter @vao/frontend-usagers... install
```

This is similar to Yarn workspaces focus: it installs the selected workspace and its dependency graph.
