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
const OTP_VERIFICATION_HEADING = "Vérification sécurisée";

async function completeOtpVerification(page: Page, email: string) {
  await expect(
    page.getByRole("heading", { name: OTP_VERIFICATION_HEADING }),
  ).toBeVisible();

  const otpCode = await getOtpCodeFromMaildev(page, email);
  await fillOtpCode(page, otpCode);
  await waitReadyPage(page);
}

async function fillOtpCode(page: Page, otpCode: string) {
  expect(otpCode).toMatch(/^\d{6}$/);

  for (let index = 0; index < 6; index++) {
    await page.locator(`#code-input-${index}`).fill(otpCode[index]);
  }

  await page.getByRole("button", { name: "Valider" }).click();
}

async function getOtpCodeFromMaildev(
  page: Page,
  email: string,
): Promise<string> {
  const { maildevUrl } = getUrls();
  const mailPage = await page.context().newPage();
  let otpCode = "";

  try {
    await expect(async () => {
      await mailPage.goto(`${maildevUrl}/#/`);
      await mailPage
        .getByRole("link", {
          // eslint-disable-next-line no-irregular-whitespace
          name: `Portail VAO - Votre code de vérification pour accéder à votre compte To: ${email}`,
        })
        .first()
        .click();

      const frame = mailPage.locator("iframe").first().contentFrame();
      const otpLocator = frame.locator("strong").filter({ hasText: /^\d{6}$/ });
      await expect(otpLocator.first()).toBeVisible();
      const code = await otpLocator.first().textContent();
      expect(code).toMatch(/^\d{6}$/);
      otpCode = code!;
    }).toPass({ timeout: 15000 });
  } finally {
    await mailPage.close();
  }

  return otpCode;
}

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
    const alertText =
      (await alert.textContent({ timeout: 1000 }).catch(() => null))?.trim() ??
      null;
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
  await completeOtpVerification(page, email);

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
  await completeOtpVerification(page, email);

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
}

export async function expectToast(page: Page, text: string) {
  await expect(
    page.locator(alertLocator).filter({ hasText: text }).first(),
  ).toBeVisible();
}

export async function acceptCgu(page: Page) {
  await page.getByText(CGU_TEXT).click();
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page.locator(alertLocator).first()).toContainText(
    "CGU acceptées avec succès",
  );
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

export async function ensureFilterIsChecked(page: Page, label: string) {
  const option = page
    .locator(multiselectCheckboxLocator)
    .getByText(label, { exact: true });
  const checkbox = option.locator("input[type='checkbox']");

  if ((await checkbox.count()) > 0) {
    if (!(await checkbox.first().isChecked())) {
      await option.click();
    }
    return;
  }

  const isSelected =
    (await option.locator("[aria-checked='true']").count()) > 0 ||
    (await option.evaluate((element) => {
      if (element.getAttribute("aria-checked") === "true") {
        return true;
      }
      return element.closest("[aria-checked='true']") !== null;
    }));

  if (!isSelected) {
    await option.click();
  }
}
