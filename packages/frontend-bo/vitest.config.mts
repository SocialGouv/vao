import { defineConfig } from "vitest/config";
import { defineVitestProject } from "@nuxt/test-utils/config";

export default defineConfig({
  test: {
    projects: [
      await defineVitestProject({
        test: {
          name: "nuxt",
          include: [
            "src/__tests__/nuxt/*.{test,spec}.ts",
            "src/utils/*.{test,spec}.ts",
          ],
          environment: "nuxt",
          globals: true,
        },
      }),
    ],
  },
});
