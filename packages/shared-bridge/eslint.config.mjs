import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig(
  {
    ignores: ["**/node_modules/**", "**/dist/**", "eslint.config.mjs"],
  },
  ...compat.extends(
    "@socialgouv/eslint-config-recommended",
    "plugin:prettier/recommended",
    "plugin:import/typescript",
  ),
  {
    files: ["src/**/*.{js,ts}"],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
);
