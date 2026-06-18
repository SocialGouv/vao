import type { FullConfig } from "@playwright/test";

import { getUrls } from "./utils/urls";

export default async function globalSetup(_config: FullConfig) {
  console.log("> GLOBAL SETUP");
  console.log("E2E_BASE_URL", process.env.E2E_BASE_URL ?? "(default)");
  console.log("TZ", process.env.TZ ?? "(system)");
  console.log("e2e urls", getUrls());
}
