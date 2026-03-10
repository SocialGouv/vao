import type { FullConfig } from "@playwright/test";

export default async function globalSetup(_config: FullConfig) {
  console.log("> GLOBAL SETUP");
  // TODO: Check required variables
}
