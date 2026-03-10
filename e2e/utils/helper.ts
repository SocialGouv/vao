import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

const runLocal = process.env.E2E_LOCAL === "true" || false;
const baseUrl =
  process.env.E2E_BASE_URL || "vao-main.ovh.fabrique.social.gouv.fr";

export function initTests() {
  // Run tests in serial mode because they are dependant on each other
  test.describe.configure({ mode: "serial" });

  const username = process.env.E2E_USERNAME || `e2e-${randomUUID()}@test.com`;
  const password = "V@o2024Vao2025";

  const params = {
    username,
    password,
    appUsagersUrl: `https://${baseUrl}`,
    appBoUrl: `https://bo-${baseUrl}`,
    maildevUrl: `https://maildev-${baseUrl}`,
  };

  if (runLocal) {
    params.appUsagersUrl = `http://localhost:8000`;
    params.appBoUrl = `http://localhost:8001`;
    params.maildevUrl = `http://localhost:1080`;
  }

  console.log("initTests", params);
  return params;
}

export async function login(page, username: string, password: string) {
  await page
    .getByLabel("Identifiant * Format attendu : nom@domaine.fr")
    .click();
  await page
    .getByLabel("Identifiant * Format attendu : nom@domaine.fr")
    .fill(username);
  await page.getByLabel("Mot de passe * Afficher mot").click();
  await page.getByLabel("Mot de passe * Afficher mot").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Bienvenue PrénomTest NomTest")).toBeVisible();
}
