const runLocal = process.env.E2E_LOCAL === "true" || false;
const baseUrl =
  process.env.E2E_BASE_URL || "vao-main.ovh.fabrique.social.gouv.fr";

export function getUrls() {
  if (runLocal) {
    return {
      apiUrl: `http://localhost:3000`,
      appUsagersUrl: `http://localhost:8000`,
      appBoUrl: `http://localhost:8001`,
      maildevUrl: `http://localhost:1080`,
    };
  }
  return {
    apiUrl: `https://api-${baseUrl}`,
    appUsagersUrl: `https://${baseUrl}`,
    appBoUrl: `https://bo-${baseUrl}`,
    maildevUrl: `https://maildev-${baseUrl}`,
  };
}
