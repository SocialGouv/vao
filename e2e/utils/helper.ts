import { expect, Locator, Page, TestInfo } from "@playwright/test";
import path from "node:path";
import { getUrls } from "./urls";
import { resetSeeds } from "./seed";

export const basicAlertLocator = "[id^='basic-v'][id$='-alert']";

export const alertLocator = "[id^='alert-v'][id$='-description']";

export const multiselectCheckboxLocator =
  "[id^='multiselect-v'][id$='-checkboxes']";

const isRunLocal = process.env.E2E_LOCAL === "true" || false;

const { apiUrl } = getUrls();

export const waitReadyPage = (page: Page) =>
  page.waitForTimeout(isRunLocal ? 500 : 2000);

export async function logSuiteName(
  testName: string,
  testInfo: TestInfo,
  withResetSeeds = false,
) {
  if (testInfo.retry > 0) {
    console.log(
      `>>>>>>>>>>>>>>>>> RETRY ATTEMPT ${testInfo.retry}: ${testName} <<<<<<<<<<<<<<<<<<`,
    );
  } else {
    console.log(`===== ${testName} =====`);
  }
  if (withResetSeeds) {
    await resetSeeds();
  }
}

export const logTestName = (testInfo: TestInfo) =>
  console.log(
    `-> ${testInfo.title} ${testInfo.retry > 0 ? `- RETRY #${testInfo.retry}` : ""}`,
  );

export const logTestResult = async (page: Page, testInfo: TestInfo) => {
  if (testInfo.status !== "passed") {
    console.log(
      `xx ${testInfo.title}: FAILED ! (${testInfo.status?.toUpperCase()}). ${testInfo.error?.message}`,
    );
  } else {
    console.log(`-> ${testInfo.title}: PASSED`);
  }
};

const AUTH_SUCCESS_TEXT = "Authentification réalisée avec succès";
const CGU_TEXT =
  "Veuillez lire et accepter les Conditions Générales d'Utilisation";

async function expectVisibleWithAlertOnFailure(
  page: Page,
  successLocator: Locator,
  contextMessage: string,
) {
  const alert = page.locator(alertLocator).first();

  await expect(async () => {
    if (await successLocator.first().isVisible()) {
      return;
    }
    const alertText = (await alert.textContent())?.trim();
    const detail = alertText
      ? `Texte de l'alerte : "${alertText}"`
      : "Aucune alerte affichée";
    throw new Error(`${contextMessage} — ${detail}`);
  }).toPass();
}

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
  await waitReadyPage(page);
  await expectVisibleWithAlertOnFailure(
    page,
    page.locator(alertLocator).first().filter({ hasText: AUTH_SUCCESS_TEXT }),
    `Connexion BO échouée (${email})`,
  );
}

export async function loginUsagers(
  page: Page,
  email: string,
  password: string,
  expectCgu = false,
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
  await waitReadyPage(page);

  const authOk = page
    .locator(alertLocator)
    .first()
    .filter({ hasText: AUTH_SUCCESS_TEXT });
  const cgu = page.getByText(CGU_TEXT);

  await expectVisibleWithAlertOnFailure(
    page,
    authOk.or(cgu),
    `Connexion usagers échouée (${email})`,
  );

  if (!expectCgu) {
    await expect(page.getByText(CGU_TEXT)).not.toBeVisible();
  }
}

export async function addInputFile(
  page: Page,
  textLocator: string,
  file: string,
) {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByText(textLocator).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(file);
}

export async function apiGet<T>(url: string, page: Page): Promise<T> {
  const response = await page.request.get(`${apiUrl}${url}`);
  if (!response.ok()) {
    console.log("GET", url, response.status(), await response.text());
  }
  expect(response.ok()).toBeTruthy();
  return await response.json();
}

export function getAgrementFile() {
  return path.join(__dirname, "../data/agrement.pdf");
}

export function getTransportsFile() {
  return path.join(__dirname, "../data/transports.pdf");
}

export function getBasicFile() {
  return path.join(__dirname, "../data/basic-file.pdf");
}
