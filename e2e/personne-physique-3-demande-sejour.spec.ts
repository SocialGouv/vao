import { test, expect, Page } from "@playwright/test";
import {
  addInputFile,
  alertLocator,
  getBasicFile,
  loginUsagers,
} from "./utils/helper";
import { getAgentsRegionalIDFUser, getOvaUser } from "./utils/users";
import { getUrls, runLocal } from "./utils/urls";

const { appUsagersUrl, appBoUrl, maildevUrl } = getUrls();

const testName = "Création demande de sejour compte OVA - Personne physique";

test.describe.serial(testName, () => {
  let username: string;
  let password: string;

  test.beforeAll(() => {
    const ctx = getOvaUser();
    username = ctx.username;
    password = ctx.password;
  });

  test(`Étape 1 - Soumission du formulaire de création de demande de séjour`, async ({
    page,
  }, testInfo) => {
    console.log(`===== ${testName} =====`);
    console.log(`-> ${testInfo.title}`);
    await page.goto(`${appUsagersUrl}`);
    await loginUsagers(page, username, password);

    await page.getByRole("button", { name: "Déclaration de séjour" }).click();
    await page.getByRole("link", { name: "Nouvelle déclaration" }).click();
    await page
      .getByRole("textbox", { name: "Titre Nom de votre demande de" })
      .click();
    await page
      .getByRole("textbox", { name: "Titre Nom de votre demande de" })
      .fill("Musée Rodin Six mai");
    await page
      .getByRole("textbox", { name: "Date de début Date du premier" })
      .press("CapsLock");
    await page
      .getByRole("textbox", { name: "Date de début Date du premier" })
      .fill("2026-06-07");
    await page
      .getByRole("textbox", { name: "Date de fin Date de fin du sé" })
      .fill("2026-08-07");
    await page.getByRole("button", { name: "Suivant" }).click();
    await page.getByRole("textbox", { name: "Hommes" }).click();
    await page.getByRole("textbox", { name: "Hommes" }).fill("5");
    await page.getByRole("textbox", { name: "Femmes" }).click();
    await page.getByRole("textbox", { name: "Femmes" }).fill("5");
    await page.getByText("-59 ans").click();
    await page.getByText("Visuel").click();
    await page
      .getByRole("textbox", { name: "Apportez plus de précisions" })
      .click();
    await page
      .getByRole("textbox", { name: "Apportez plus de précisions" })
      .press("CapsLock");
    await page
      .getByRole("textbox", { name: "Apportez plus de précisions" })
      .fill("léger");
    await page.getByRole("button", { name: "Suivant" }).click();
    await page
      .getByRole("textbox", { name: "Nombre total de personnes" })
      .click();
    await page
      .getByRole("textbox", { name: "Nombre total de personnes" })
      .press("CapsLock");
    await page
      .getByRole("textbox", { name: "Nombre total de personnes" })
      .fill("1");
    await page
      .getByRole("textbox", { name: "Nombre total d'accompagnants" })
      .click();
    await page
      .getByRole("textbox", { name: "Nombre total d'accompagnants" })
      .fill("1");
    await page.getByText("Non").click();
    await page.getByRole("button", { name: "Suivant" }).click();
    await page.getByText("Séjour à thème").click();
    await page.getByRole("button", { name: "Suivant" }).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "Suivant" }).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "Suivant" }).click();
    await page
      .getByRole("button", { name: "Ajouter une fiche hébergement" })
      .click();
    await page.getByLabel("Hebergement").selectOption({ label: "Rodin Musée" });
    await page.getByRole("button", { name: "Ajouter l’hébergement" }).click();
    await page.waitForTimeout(200);
    await page.getByRole("button", { name: "Suivant" }).click();
    await page.getByText("Je certifie sur l'honneur que").click();
    await page.getByRole("textbox", { name: "Qualité" }).click();
    await page
      .getByRole("textbox", { name: "Qualité" })
      .fill("OVA Personne Physique");
    await page
      .getByRole("button", { name: "Transmettre ma déclaration de" })
      .click();
    await expect(page.getByText("Félicitations, votre dé")).toBeVisible();
    await expect(page.getByText("Le PDF déclaration_2_mois a é")).toBeVisible();
  });
});
