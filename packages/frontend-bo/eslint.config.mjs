import { createConfigForNuxt } from "@nuxt/eslint-config";
import eslintConfigPrettier from "eslint-config-prettier/flat";

// example: https://github.com/nuxt/nuxt/blob/main/eslint.config.mjs
export default createConfigForNuxt({
  typescript: true,
})
  .prepend({
    languageOptions: {
      globals: {
        $fetch: "readonly",
        logger: "readonly",
        defineNuxtPlugin: "readonly",
        useRuntimeConfig: "readonly",
        Sentry: "readonly",
        defineNuxtRouteMiddleware: "readonly",
        navigateTo: "readonly",
        isRef: "readonly",
        defineEmits: "readonly",
        useRequestHeaders: "readonly",
        useAsyncData: "readonly",
      },
    },
  })
  .override("nuxt/vue/rules", {
    rules: {
      "vue/multi-word-component-names": "warn",
      "vue/no-side-effects-in-computed-properties": "warn",
      "vue/valid-define-emits": "warn",
    },
  })
  .override("nuxt/javascript", {
    rules: {
      "no-unused-vars": "warn",
    },
  })
  .override("nuxt/typescript/rules", {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn"],
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/no-unused-expressions": ["warn"],
    },
  })
  .append(eslintConfigPrettier);
