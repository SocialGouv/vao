import { getUrls } from "./urls";

export async function resetSeeds() {
  console.log("---------------- E2E reset seeds ----------------");
  const { apiUrl } = getUrls();

  const response = await fetch(`${apiUrl}/e2e/reset`, {
    method: "POST",
  });

  if (!response.ok) {
    const responseBody = await response.text();
    throw new Error(
      `E2E reset failed (${response.status}): ${responseBody || "no response body"}`,
    );
  }

  const payload = await response.json();
  console.log(payload);
  console.log("---------------- E2E reset done ----------------");
}
