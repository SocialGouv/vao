import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "unit",
    include: ["src/utils/*.{test,spec}.ts", "src/helpers/*.{test,spec}.ts"],
    environment: "node",
    globals: true,
  },
});
