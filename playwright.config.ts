import { defineConfig, devices } from "@playwright/test";

import { getMaildevCredentials } from "./e2e/utils/urls";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Traces et vidéos enregistrent les identifiants du contexte et les valeurs
 * saisies par `fill`, et le rapport part en artefact d'un dépôt public. Sur CI
 * elles ne sont donc retenues que là où les tests tournent avec des comptes
 * factices, c'est-à-dire les review apps, qui doivent le demander
 * explicitement : une variable absente coupe la rétention, jamais l'inverse.
 * Sur `main` et preprod il ne reste que le rapport HTML.
 */
const retainCiArtifacts = process.env.E2E_RETAIN_ARTIFACTS === "true";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { open: "never" }], ["list"]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    httpCredentials: getMaildevCredentials(),
    trace: process.env.CI
      ? retainCiArtifacts
        ? "retain-on-failure"
        : "off"
      : "on-first-retry",
    screenshot: "only-on-failure",
    video: process.env.CI && retainCiArtifacts ? "retain-on-failure" : "off",
    actionTimeout: process.env.CI ? 25_000 : 15_000,
    navigationTimeout: process.env.CI ? 25_000 : 15_000,
  },
  globalSetup: require.resolve("./e2e/global.setup.ts"),
  timeout: process.env.CI ? 60_000 : 30_000,
  expect: {
    timeout: process.env.CI ? 15_000 : 10_000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
