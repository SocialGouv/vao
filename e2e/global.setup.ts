import type { FullConfig } from "@playwright/test";

import { resetSeeds } from "./utils/seed";
import { getUrls } from "./utils/urls";

export default async function globalSetup(_config: FullConfig) {
  console.log("> GLOBAL SETUP");
  console.log("e2e urls", getUrls());
  await resetSeeds();
}
