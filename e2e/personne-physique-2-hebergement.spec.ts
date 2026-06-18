import { test, expect, Page } from "@playwright/test";
import {
  addInputFile,
  alertLocator,
  getBasicFile,
  loginUsagers,
  logSuiteName,
  logTestName,
  logTestResult,
} from "./utils/helper";
import { getOvaUser } from "./utils/users";
import { getUrls } from "./utils/urls";

const { appUsagersUrl } = getUrls();
const userOva = getOvaUser();

const testName = "Création hébergement compte OVA - Personne physique";
test.describe.serial(testName, () => {
  test.afterEach(async ({ page }, testInfo) => {
    await logTestResult(page, testInfo);
  });
  test("Étape 1 - Soumission du formulaire de création d'hébergement (OVA)", async ({
    page,
  }, testInfo) => {
    await logSuiteName(testName, testInfo, false);
    logTestName(testInfo);
    await page.goto(`${appUsagersUrl}`);
    await loginUsagers(page, userOva.username, userOva.password);

    await page.getByRole("link", { name: "Mes hébergements" }).click();
    await page
      .getByRole("link", { name: "Déclarer un nouvel hébergement" })
      .click();

    await page.getByRole("textbox", { name: "Nom de l'hébergement *" }).click();
    await page
      .getByRole("textbox", { name: "Nom de l'hébergement *" })
      .fill("Rodin Musée");
    await page.getByRole("textbox", { name: "Nom du gestionnaire *" }).click();
    await page
      .getByRole("textbox", { name: "Nom du gestionnaire *" })
      .fill("Gestionnaire Rodin");
    await page.getByRole("combobox").click();
    await page.getByRole("combobox").fill("77 rue de varennes 75007 Paris");
    await page
      .getByRole("button", { name: "Rue de Varenne 75007 Paris" })
      .click();
    await page
      .getByRole("textbox", { name: "Numéro de téléphone 1 * Le" })
      .click();
    await page
      .getByRole("textbox", { name: "Numéro de téléphone 1 * Le" })
      .fill("0178787878");
    await page
      .getByRole("textbox", { name: "Numéro de téléphone 2 Le numé" })
      .click();
    await page
      .getByRole("textbox", { name: "Adresse courriel Format" })
      .click();
    await page
      .getByRole("textbox", { name: "Adresse courriel Format" })
      .fill("gestionnaire@example.com");
    await page.getByText("Hôtel", { exact: true }).click();
    await page
      .getByLabel("Une visite des locaux par l’")
      .getByText("Oui")
      .click();
    await page
      .getByRole("textbox", { name: "Date de la dernière visite (" })
      .fill("2023-12-12");
    await page
      .getByLabel("Le lieu d’hébergement est-il")
      .getByText("Oui")
      .click();
    // fichiers
    await addInputFile(
      page,
      "Téléchargement du document Dernière attestation de passage de la commission sécurité",
      getBasicFile(),
    );
    await addInputFile(
      page,
      "Téléchargement du document Dernier arrêté d’autorisation du maire Taille",
      getBasicFile(),
    );

    await page.getByRole("group", { name: "Accessibilité  *" }).click();
    await page.getByText("Accessible").click();
    await page.getByText("Hébergement seul").click();
    await page.getByText("Entretien des locaux").click();
    await page
      .getByRole("textbox", { name: "Description du lieu d’hé" })
      .click();
    await page
      .getByRole("textbox", { name: "Description du lieu d’hé" })
      .fill("Sanitaires surélevés");
    await page
      .getByRole("spinbutton", { name: "Nombre de lits dans le lieu d" })
      .click();
    await page
      .getByRole("spinbutton", { name: "Nombre de lits dans le lieu d" })
      .fill("10");
    await page
      .getByRole("spinbutton", { name: "Nombre maximum de personnes" })
      .click();
    await page
      .getByRole("spinbutton", { name: "Nombre maximum de personnes" })
      .fill("2");
    await page
      .getByRole("spinbutton", { name: "Nombre de lits superposés" })
      .fill("0");
    await page
      .getByLabel("Chaque vacancier bénéficie-t-")
      .getByText("Oui")
      .click();
    await page
      .getByLabel("Chaque vacancier bénéficie t-")
      .getByText("Oui")
      .click();
    await page.getByLabel("Les femmes et les hommes").getByText("Oui").click();
    await page
      .getByLabel("Les couples de vacanciers bén")
      .getByText("Oui")
      .click();
    await page
      .getByLabel("Des aménagements spécifiques")
      .getByText("Non")
      .click();
    await page
      .getByLabel("Les véhicules utilisés sont-")
      .getByText("Non")
      .click();
    await page
      .getByRole("textbox", {
        name: "Précisez la fréquence, les distances et le mode de transport utilisé pour les d",
      })
      .click();
    await page
      .getByLabel("Des aménagements spécifiques")
      .getByText("Oui")
      .click();
    await page
      .getByRole("textbox", { name: "Précisez les informations" })
      .click();
    await page
      .getByRole("textbox", { name: "Précisez les informations" })
      .fill("Ascenseur entre le rdc et le premier étage");
    await page
      .getByRole("textbox", {
        name: "Précisez la fréquence, les distances et le mode de transport utilisé pour les d",
      })
      .click();
    await page
      .getByRole("textbox", {
        name: "Précisez la fréquence, les distances et le mode de transport utilisé pour les d",
      })
      .fill("Quotidienne ; 2 kms ; voiture");
    await page
      .getByRole("textbox", {
        name: "Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions *",
        exact: true,
      })
      .click();
    await page
      .getByRole("textbox", {
        name: "Précisez la fréquence, les distances et le mode de transport utilisé pour les excursions *",
        exact: true,
      })
      .fill("Quotidienne ; 5 kms ; voiture");
    await page.getByRole("button", { name: "Ajouter l'hébergement" }).click();
    await expect(page.locator(alertLocator).nth(1)).toContainText(
      "Hébergement sauvegardé",
    );
  });
});
