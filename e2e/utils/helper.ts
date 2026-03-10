import { expect, Page, test } from "@playwright/test";
import { randomUUID } from "crypto";
import { getUrls } from "./urls";

export function initTests() {
  // Run tests in serial mode because they are dependant on each other
  // test.describe.configure({ mode: "serial" });

  const username =
    process.env.E2E_USERNAME || `e2e-${randomUUID()}@example.com`;
  const password = "Azertyuiop1!";

  const params = {
    username,
    password,
    ...getUrls(),
  };

  console.log("initTests", params);
  return params;
}

export const basicAlertLocator = "[id^='basic-v'][id$='-alert']";

export const alertLocator = "[id^='alert-v'][id$='-description']";

export async function loginBo(page: Page, email: string, password: string) {
  await page
    .getByRole("textbox", { name: "Identifiant * Format attendu" })
    .click();
  await page
    .getByRole("textbox", { name: "Identifiant * Format attendu" })
    .fill(email);
  await page.getByRole("textbox", { name: "Mot de passe * Veuillez" }).click();
  await page
    .getByRole("textbox", { name: "Mot de passe * Veuillez" })
    .fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  // await expect(page.locator(alertLocator).first()).not.toContainText(
  //   "Échec de l'authentification",
  // );
}

export async function loginUsagers(
  page: Page,
  email: string,
  password: string,
) {
  await page
    .getByRole("textbox", { name: "Identifiant * Format attendu" })
    .click();
  await page
    .getByRole("textbox", { name: "Identifiant * Format attendu" })
    .fill(email);
  await page.getByRole("textbox", { name: "Mot de passe * Veuillez" }).click();
  await page
    .getByRole("textbox", { name: "Mot de passe * Veuillez" })
    .fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  // await expect(page.locator(alertLocator).first()).not.toContainText(
  //   "Échec de l'authentification",
  // );
}
