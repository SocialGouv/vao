import { test, expect, type Page } from "@playwright/test";
import {
  alertLocator,
  apiGet,
  ensureFilterIsChecked,
  loginBo,
  loginUsagers,
  logSuiteName,
  logTestName,
  logTestResult,
  waitReadyPage,
} from "./utils/helper";
import { getAgentDepartement75Paris, getOvaUser } from "./utils/users";
import { getUrls } from "./utils/urls";
import { addMonths, formatISOShort } from "../packages/shared-bridge";

const { appUsagersUrl, appBoUrl, maildevUrl } = getUrls();

const testName = "Création demande de sejour compte OVA - Personne physique";

interface Sejour {
  declarationId: number;
  idFonctionnelle: string;
  statut: string;
}
let sejour: Sejour;

const userOva = getOvaUser();
const agentDepartement75Paris = getAgentDepartement75Paris();

test.describe.serial(testName, () => {
  test.afterEach(async ({ page }, testInfo) => {
    await logTestResult(page, testInfo);
  });
  test(`Étape 1 - Soumission du formulaire de création de demande de séjour M-1 (OVA)`, async ({
    page,
  }, testInfo) => {
    await logSuiteName(testName, testInfo, false);
    logTestName(testInfo);
    await page.goto(`${appUsagersUrl}`);
    await loginUsagers(page, userOva.username, userOva.password);

    await page.getByRole("button", { name: "Déclaration de séjour" }).click();
    await page.getByRole("link", { name: "Nouvelle déclaration" }).click();
    // page 1
    await page
      .getByRole("textbox", { name: "Titre Nom de votre demande de" })
      .click();
    await page
      .getByRole("textbox", { name: "Titre Nom de votre demande de" })
      .fill("Musée Rodin Six mai");
    await page
      .getByRole("textbox", { name: "Date de début Date du premier" })
      .press("CapsLock");

    // dates de début et fin de séjour
    await page
      .getByRole("textbox", { name: "Date de début Date du premier" })
      .fill(formatISOShort(addMonths(new Date(), 1))!);
    await page
      .getByRole("textbox", { name: "Date de fin Date de fin du sé" })
      .fill(formatISOShort(addMonths(new Date(), 3))!);
    await page.getByRole("button", { name: "Suivant" }).click();
    await waitReadyPage(page);

    // page 2
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
    await expect(page.locator(alertLocator).nth(1)).toContainText(
      "Déclaration de séjour créée",
    );

    // page 3
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
    await waitReadyPage(page);
    await expect(page.locator(alertLocator).nth(2)).toContainText(
      "Déclaration de séjour sauvegardée",
    );

    // page 4
    await page.getByText("Séjour à thème").click();
    await page.getByRole("button", { name: "Suivant" }).click();
    await waitReadyPage(page);
    await expect(page.locator(alertLocator).nth(3)).toContainText(
      "Déclaration de séjour sauvegardée",
    );

    // page 5
    await page.getByRole("button", { name: "Suivant" }).click();
    await waitReadyPage(page);
    await expect(page.locator(alertLocator).nth(4)).toContainText(
      "Déclaration de séjour sauvegardée",
    );

    // page 6
    await page.getByRole("button", { name: "Suivant" }).click();
    await waitReadyPage(page);
    // await expect(page.locator(alertLocator).nth(5)).toContainText(
    //   "Déclaration de séjour sauvegardée",
    // );

    // page 7
    await page
      .getByRole("button", { name: "Ajouter une fiche hébergement" })
      .click();
    await page.getByLabel("Hebergement").selectOption({ label: "Rodin Musée" });
    await waitReadyPage(page);
    await page.getByRole("button", { name: "Ajouter l’hébergement" }).click();
    await expect(
      page.getByLabel("Formulaire", { exact: true }).locator("tbody"),
    ).toContainText("Rodin Musée");
    await waitReadyPage(page);
    await page.getByRole("button", { name: "Suivant" }).click();
    await waitReadyPage(page);
    await expect(page.locator(alertLocator).nth(5)).toContainText(
      "Déclaration de séjour sauvegardée",
    );

    // page 8
    await page.getByRole("button", { name: "Hébergements " }).click();
    await page.getByRole("button", { name: "Fermer le message" }).click();
    await expect(page.locator("#synthese")).not.toContainText("incomplet");
    await page.getByText("Je certifie sur l'honneur que").click();
    await page.getByRole("textbox", { name: "Qualité" }).click();
    await page
      .getByRole("textbox", { name: "Qualité" })
      .fill("OVA Personne Physique");
    await page
      .getByRole("button", { name: "Transmettre ma déclaration de" })
      .click();

    await waitReadyPage(page);
    await expect(page.locator(alertLocator).nth(6)).toContainText(
      "Félicitations, votre dé",
    );
    await expect(page.locator(alertLocator).nth(7)).toContainText(
      "Le PDF déclaration_2_mois a é",
    );

    // button tittle "Fermer la fenêtre modale"
    await page.getByTitle("Fermer la fenêtre modale").click();

    const { demandes } = await apiGet<{
      demandes: Sejour[];
    }>("/sejour?limit=10&offset=0&sortBy=createdAt&sortDirection=DESC", page);

    const trasnmise = demandes.find(
      (demande) => demande.statut === "TRANSMISE",
    );
    expect(trasnmise?.statut).toBe("TRANSMISE");
    sejour = trasnmise!;

    // page de liste visible
    // await expect(page.getByText(sejour.idFonctionnelle)).toBeVisible();
  });

  test(`Étape 2 - Notification de la transmission de la déclaration de séjour`, async ({
    page,
  }, testInfo) => {
    logTestName(testInfo);

    await page.goto(`${maildevUrl}/#/`);

    // Notification departement
    await page
      .getByRole("link", {
        name: `Portail VAO - Nouvelle déclaration déposée : ${sejour.idFonctionnelle}`,
      })
      .first()
      .click();
    await expect(
      page.getByText(agentDepartement75Paris.username, { exact: true }).first(),
    ).toBeVisible();
    await page
      .locator("iframe")
      .first()
      .contentFrame()
      .getByText("PORTAIL VAO ADMINISTRATION -")
      .click();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByText(`La déclaration de séjour ${sejour.idFonctionnelle}`),
    ).toBeVisible();
    await page
      .locator("iframe")
      .first()
      .contentFrame()
      .getByText("La DDETS du département 75")
      .click();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByText("Cordialement.L'équipe du SI"),
    ).toBeVisible();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByRole("link", { name: appUsagersUrl }),
    ).toBeVisible();

    // Transmission (oav)
    await page
      .getByRole("link", {
        name: `Portail VAO - Transmission de la déclaration de séjour VAO n°${sejour.idFonctionnelle}`,
      })
      .click();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByText("Portail VAO - Transmission de la déclaration de séjour"),
    ).toBeVisible();
    await page
      .locator("iframe")
      .first()
      .contentFrame()
      .getByText("Bonjour,")
      .click();
    await page
      .locator("iframe")
      .first()
      .contentFrame()
      .getByText(
        `Bonjour, Votre déclaration de séjour n°${sejour.idFonctionnelle}`,
      )
      .click();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByRole("link", { name: "Accéder à ma déclaration" }),
    ).toBeVisible();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByText("Cordialement.L'équipe du SI"),
    ).toBeVisible();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByRole("link", { name: "Portail VAO" }),
    ).toBeVisible();
  });

  test(`Étape 3 - Validation de la déclaration de séjour (DDETS 75)`, async ({
    page,
  }, testInfo) => {
    logTestName(testInfo);

    await page.goto(appBoUrl);
    await loginBo(
      page,
      agentDepartement75Paris.username,
      agentDepartement75Paris.password,
    );

    await page
      .getByRole("link", { name: "Déclarations reçues à traiter" })
      .click();
    await page.getByLabel("Nombre de lignes par page").selectOption("20");
    await page.getByRole("button", { name: "options sélectionnées" }).click();
    await ensureFilterIsChecked(page, "EN COURS");
    await ensureFilterIsChecked(page, "TRANSMISE");
    await page.getByRole("button", { name: "Trier par Numéro de dé" }).click();
    await page.getByRole("textbox", { name: "Numéro de déclaration" }).click();
    await page
      .getByRole("textbox", { name: "Numéro de déclaration" })
      .fill(sejour.idFonctionnelle);

    await page
      .getByRole("row", { name: `${sejour.idFonctionnelle} Musée Rodin Six` })
      .getByRole("button")
      .click();
    await page
      .getByRole("button", { name: "Valider la prise en charge" })
      .click();
    await page.waitForResponse(
      (r) =>
        r.url().includes("/prise-en-charge") &&
        r.request().method() === "POST" &&
        r.ok(),
    );

    // la redirection auto vers la page de formulaire ne fonctionne pas dans le test (sur la ci), donc on le fait manuellement
    await page.goto(`${appBoUrl}/sejours/${sejour.declarationId}/formulaire`);

    await page.getByRole("button", { name: "Accepter" }).click();
    await page
      .getByRole("button", { name: "Enregistrer la déclaration" })
      .click();
    await expect(
      page.getByText("EN ATTENTE DECLARATION 8 JOURS"),
    ).toBeVisible();
  });

  test(`Étape 4 - Notification OVA`, async ({ page }, testInfo) => {
    logTestName(testInfo);

    await page.goto(`${maildevUrl}/#/`);

    await page
      .getByRole("link", {
        name: `Portail VAO - Enregistrement de la déclaration ${sejour.idFonctionnelle}`,
      })
      .click();

    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByText("Bonjour, Vous êtes titulaire"),
    ).toBeVisible();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByRole("link", { name: "Accéder à ma déclaration" }),
    ).toBeVisible();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByText("Cordialement.L'équipe du SI"),
    ).toBeVisible();
    await expect(
      page
        .locator("iframe")
        .first()
        .contentFrame()
        .getByRole("link", { name: "Portail VAO" }),
    ).toBeVisible();
  });
});
