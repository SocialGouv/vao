export const isRunLocal = process.env.E2E_LOCAL === "true" || false;

const baseUrl =
  process.env.E2E_BASE_URL || "vao-main.ovh.fabrique.social.gouv.fr";

function withMaildevBasicAuth(maildevUrl: string): string {
  const username = process.env.E2E_MAILDEV_USERNAME;
  const password = process.env.E2E_MAILDEV_PASSWORD;
  if (!username || !password) {
    return maildevUrl;
  }

  const parsed = new URL(maildevUrl);
  parsed.username = username;
  parsed.password = password;
  const href = parsed.href;
  if (href.endsWith("/")) {
    return href.slice(0, -1);
  }
  return href;
}

export function getUrls() {
  let urls = {
    apiUrl: `http://localhost:3000`,
    appUsagersUrl: `http://localhost:8000`,
    appBoUrl: `http://localhost:8001`,
    maildevUrl: `http://localhost:1080`,
  };
  if (!isRunLocal) {
    urls = {
      apiUrl: `https://api-${baseUrl}`,
      appUsagersUrl: `https://${baseUrl}`,
      appBoUrl: `https://bo-${baseUrl}`,
      maildevUrl: `https://maildev-${baseUrl}`,
    };
  }
  return {
    ...urls,
    maildevUrl: withMaildevBasicAuth(urls.maildevUrl),
  };
}
