import type { FullConfig } from "@playwright/test";

import { getUrls } from "./utils/urls";

function urlsForLog() {
  const urls = getUrls();
  const maildevUrl = new URL(urls.maildevUrl);
  maildevUrl.username = "";
  maildevUrl.password = "";
  return {
    ...urls,
    maildevUrl: maildevUrl.origin,
  };
}

export default async function globalSetup(_config: FullConfig) {
  console.log("> GLOBAL SETUP");
  console.log("E2E_BASE_URL", process.env.E2E_BASE_URL ?? "(default)");
  console.log("TZ", process.env.TZ ?? "(system)");
  console.log("e2e urls", urlsForLog());
  console.log(
    "E2E_MAILDEV_USERNAME",
    process.env.E2E_MAILDEV_USERNAME ? "(set)" : "(unset)",
  );
}
