import type { FullConfig } from "@playwright/test";

import { getUrls } from "./utils/urls";

export default async function globalSetup(_config: FullConfig) {
  console.log("> GLOBAL SETUP");
  const { apiUrl } = getUrls();
  const resetUrl = `${apiUrl}/e2e/reset`;

  console.log(`> E2E reset: ${resetUrl}`);
  const response = await fetch(resetUrl, {
    method: "POST",
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `E2E reset failed (${response.status}): ${responseBody || "no response body"}`,
    );
  }

  const payload = await response.json();
  console.log("> E2E reset done", payload);
}
