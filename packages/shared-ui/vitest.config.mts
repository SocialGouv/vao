import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "unit",
    include: ["src/**/*.spec.ts"],
    environment: "node",
  },
});
