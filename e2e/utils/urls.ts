export const isRunLocal = process.env.E2E_LOCAL === "true" || false;

const baseUrl =
  process.env.E2E_BASE_URL || "vao-main.ovh.fabrique.social.gouv.fr";

export function getUrls() {
  if (isRunLocal) {
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

/**
 * Identifiants HTTP basic de Maildev, restreints à son origine : Playwright ne
 * les émet que vers Maildev, jamais vers le front ou l'API VAO. Ils ne
 * transitent pas par l'URL, qui serait recopiée telle quelle dans les traces et
 * le rapport HTML uploadés en artefact.
 */
export function getMaildevCredentials() {
  const username = process.env.E2E_MAILDEV_USERNAME;
  const password = process.env.E2E_MAILDEV_PASSWORD;
  if (!username || !password) {
    return undefined;
  }
  return {
    username,
    password,
    origin: new URL(getUrls().maildevUrl).origin,
  };
}
