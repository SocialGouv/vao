import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: ["**/node_modules/**", "**/dist/**"],
  },
  ...compat.extends(
    "@socialgouv/eslint-config-recommended",
    "plugin:prettier/recommended",
    "plugin:import/typescript",
  ),
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{js,ts}"],
    rules: {
      "prettier/prettier": "error",
    },
  },
];
