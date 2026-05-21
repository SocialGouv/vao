import { expect, Page } from "@playwright/test";
import path from "node:path";

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
  await page.waitForTimeout(200);
  await expect(page.getByText("Échec de l'authentification")).toHaveCount(0);
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
  await page.waitForTimeout(200);
  await expect(page.getByText("Échec de l'authentification")).toHaveCount(0);
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

export function getAgrementFile() {
  return path.join(__dirname, "../data/agrement.pdf");
}

export function getTransportsFile() {
  return path.join(__dirname, "../data/transports.pdf");
}

export function getBasicFile() {
  return path.join(__dirname, "../data/basic-file.pdf");
}
