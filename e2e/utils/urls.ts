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

/** Environnements où Maildev est derrière une authentification HTTP basic. */
const PROTECTED_ENVS = ["vao-main.", "vao-preprod."];

export function isMaildevProtected() {
  return !isRunLocal && PROTECTED_ENVS.some((env) => baseUrl.startsWith(env));
}

/**
 * Identifiants HTTP basic de Maildev, restreints à son origine : Playwright ne
 * les émet que vers Maildev, jamais vers le front ou l'API VAO. Ils ne
 * transitent pas par l'URL, qui serait recopiée telle quelle dans les messages
 * d'erreur de navigation et le rapport HTML uploadés en artefact.
 *
 * Une absence d'identifiant sur un environnement protégé échoue ici plutôt que
 * de se traduire, trente secondes plus tard, en un timeout sur un mail
 * introuvable.
 */
export function getMaildevCredentials() {
  const username = process.env.E2E_MAILDEV_USERNAME;
  const password = process.env.E2E_MAILDEV_PASSWORD;

  if (Boolean(username) !== Boolean(password)) {
    throw new Error(
      "E2E_MAILDEV_USERNAME et E2E_MAILDEV_PASSWORD doivent être définis ensemble.",
    );
  }
  if (!username || !password) {
    if (isMaildevProtected()) {
      throw new Error(
        `Maildev est protégé par mot de passe sur ${baseUrl} : définissez E2E_MAILDEV_USERNAME et E2E_MAILDEV_PASSWORD.`,
      );
    }
    return undefined;
  }
  return {
    username,
    password,
    origin: new URL(getUrls().maildevUrl).origin,
  };
}
