import { test, expect, Page } from "@playwright/test";
import {
  addInputFile,
  alertLocator,
  basicAlertLocator,
  getAgrementFile,
  getTransportsFile,
  loginBo,
  loginUsagers,
} from "./utils/helper";
import { agentsRegionalIDF, getUser } from "./utils/users";
import { getUrls } from "./utils/urls";

const { appUsagersUrl, appBoUrl, maildevUrl } = getUrls();

test.describe.serial("Création de compte OVA - Personne physique", () => {
  let validationPage: Page;
  let username: string;
  let password: string;

  test.beforeAll(() => {
    const ctx = getUser();
    username = ctx.username;
    password = ctx.password;
  });

  test("Étape 1 — Création de la demande de compte", async ({ page }) => {
    console.log("Étape 1 — Création de la demande de compte");
    await page.goto(`${appUsagersUrl}/connexion`);
    await expect(page.getByText("Connexion à VAO")).toBeVisible();

    await page.getByRole("button", { name: "Créer un compte" }).click();
    await page
      .getByRole("textbox", { name: "Adresse courriel Format" })
      .click();
    await page
      .getByRole("textbox", { name: "Adresse courriel Format" })
      .fill(username);
    await page
      .getByRole("textbox", { name: "Mot de passe Veuillez saisir" })
      .click();
    await page
      .getByRole("textbox", { name: "Mot de passe Veuillez saisir" })
      .fill(password);
    await page
      .getByRole("textbox", { name: "Confirmation mot de passe" })
      .click();
    await page
      .getByRole("textbox", { name: "Confirmation mot de passe" })
      .fill(password);
    await page
      .getByRole("textbox", { name: "Nom Veuillez saisir votre nom" })
      .click();
    await page
      .getByRole("textbox", { name: "Nom Veuillez saisir votre nom" })
      .fill("JourdainAutomatisé");
    await page
      .getByRole("textbox", { name: "Prénom Veuillez saisir votre" })
      .click();
    await page
      .getByRole("textbox", { name: "Prénom Veuillez saisir votre" })
      .fill("Olivier");
    await page
      .getByRole("textbox", { name: "Numéro de téléphone Veuillez" })
      .click();
    await page
      .getByRole("textbox", { name: "Numéro de téléphone Veuillez" })
      .fill("0600000000");
    await page
      .getByRole("textbox", { name: "SIRET Veuillez indiquer le" })
      .click();
    await page
      .getByRole("textbox", { name: "SIRET Veuillez indiquer le" })
      .fill("43286010400301");
    await page.getByRole("button", { name: "Créer mon compte" }).click();
    await expect(page.locator(alertLocator).first()).toContainText(
      "Votre formulaire a été envoyé. Veuillez valider votre adresse mail en cliquant sur le lien reçu par mail.",
    );
  });

  test("Étape 2 — Validation de la demande", async ({ page }) => {
    console.log("Étape 2 — Validation de la demande");
    await page.goto(`${maildevUrl}/#/`);
    await page
      .getByRole("link", {
        name: `Portail VAO - Validez votre adresse courriel To: ${username}`,
      })
      .click();
    const popupPromise = page.waitForEvent("popup");
    await page
      .locator("iframe")
      .first()
      .contentFrame()
      .getByRole("link", { name: "Je valide mon adresse courriel" })
      .click();
    validationPage = await popupPromise;
    await expect(
      validationPage.locator(basicAlertLocator).first(),
    ).toContainText("Votre adresse courriel est maintenant activée");
    await expect(
      validationPage.locator(basicAlertLocator).first(),
    ).toContainText("Votre compte est en cours de validation.");
    await expect(validationPage.locator(alertLocator).first()).toContainText(
      "Votre demande a bien été envoyée, votre inscription est en attente de validation",
    );
  });

  test("Étape 3 — Activation du compte", async ({ page }) => {
    console.log("Étape 3 — Activation du compte");
    await page.goto(`${appBoUrl}`);
    await loginBo(page, agentsRegionalIDF.email, agentsRegionalIDF.password);

    // Validation du compte
    await page.getByRole("button", { name: "Comptes" }).click();
    await page.getByRole("link", { name: "Validation des OVA" }).click();
    await page
      .getByRole("button", { name: "Valider le compte" })
      .first()
      .click();
    await expect(page.locator('[id="__nuxt"]')).toContainText(
      "La demande de création de compte a été validée par vos soins. L’utilisateur va recevoir un mail pour le prévenir.Fermer",
    );
  });

  test("Étape 4 — Complétion du compte", async ({ page }) => {
    console.log("Étape 4 — Complétion du compte");
    await page.goto(`${appUsagersUrl}`);
    await loginUsagers(page, username, password);

    await page
      .getByText(
        "Veuillez lire et accepter les Conditions Générales d'Utilisation ",
      )
      .click();
    await page.getByRole("button", { name: "Valider" }).click();
    await expect(page.locator(alertLocator).first()).toContainText(
      "CGU acceptées avec succès",
    );
    await page.getByRole("link", { name: "Renseigner ma fiche" }).click();

    // ETAPES 1
    await page.getByText("Personne physique (forme").click();
    await page
      .getByRole("button", { name: "Récupérer les informations de" })
      .click();
    await expect(page.locator(alertLocator).nth(1)).toContainText(
      "Données récupérées",
    );
    await page
      .getByLabel("Profession")
      .selectOption("Agriculture, sylviculture et pêche");
    await page
      .getByRole("textbox", { name: "numéro de téléphone Veuillez" })
      .click();
    await page
      .getByRole("textbox", { name: "numéro de téléphone Veuillez" })
      .fill("0101010101");
    await page.getByText("Oui").click();
    await page.getByRole("button", { name: "Suivant" }).click();

    // ETAPES 2
    await expect(page.locator(alertLocator).nth(2)).toContainText(
      "Fiche organisateur créée",
    );
    await page
      .getByRole("textbox", { name: "Numéro d'agrément “Vacances" })
      .click();
    await page
      .getByRole("textbox", { name: "Numéro d'agrément “Vacances" })
      .press("CapsLock");
    await page
      .getByRole("textbox", { name: "Numéro d'agrément “Vacances" })
      .fill("AGR-001-2026-003");
    await page
      .getByRole("textbox", { name: "Date d'obtention de l'agré" })
      .fill("2025-02-02");
    await page.getByLabel("Région d’obtention de l’agré").selectOption("IDF");

    await addInputFile(page, "Ajouter une copie de votre", getAgrementFile());
    await addInputFile(page, "Si vous souhaitez remplacer", getAgrementFile());

    await page.getByRole("button", { name: "Suivant" }).click();
    await expect(page.locator(alertLocator).nth(3)).toContainText(
      "Agrément sauvegardé",
    );

    // ETAPES 3
    await page.getByText("Le transport vers le lieu de").click();
    await page.getByText("Train").click();
    await page.getByText("Autobus, car").click();
    await page.getByText("Automobile").click();
    await page.getByRole("textbox", { name: "Précisez le mode d’" }).click();
    await page.getByRole("textbox", { name: "Précisez le mode d’" }).fill("D");
    await page
      .getByRole("textbox", { name: "Précisez le mode d’" })
      .press("CapsLock");
    await page
      .getByRole("textbox", { name: "Précisez le mode d’" })
      .fill("Description Organisation");
    await page
      .getByLabel("Des déplacements sont-ils pré")
      .getByText("Oui")
      .click();
    await page
      .getByLabel("Les véhicules utilisés sont-")
      .getByText("Non")
      .click();
    await addInputFile(
      page,
      "Vous avez la possibilité de",
      getTransportsFile(),
    );
    await page.getByRole("button", { name: "Suivant" }).click();

    // ETAPES 4
    await page.getByLabel("Des dispositions d’ordre").getByText("Non").click();
    await page.getByText("Une personne formée aux").click();
    await page
      .getByRole("textbox", { name: "Précisez la constitution de l" })
      .click();
    await page
      .getByRole("textbox", { name: "Précisez la constitution de l" })
      .fill("Constitution équipe");
    await page
      .getByLabel("Un accord est-il passé avec")
      .getByText("Non")
      .click();
    await page
      .getByRole("group", { name: "Présence d’une trousse à" })
      .locator("div")
      .first()
      .click();
    await page.getByText("Responsable du séjour").click();
    await page.getByRole("textbox", { name: "Précisez le rôle des" }).click();
    await page
      .getByRole("textbox", { name: "Précisez le rôle des" })
      .fill("Distribution");
    await page
      .getByLabel("Stockage des médicaments dans")
      .getByText("Non")
      .click();
    await page
      .getByLabel(
        "Un dispositif est-il prévu pour la conservation des médicaments thermosensibles",
      )
      .getByText("Non")
      .click();
    await page
      .getByLabel(
        "Un dispositif est-il prévu pour individualiser les traitements de chaque",
      )
      .getByText("Non")
      .click();
    await page.getByText("Sans objet").click();
    await page
      .getByLabel("Une prescription médicale est")
      .getByText("Non")
      .click();
    await page
      .getByLabel(
        "Existe-t-il un protocole en cas de modification de traitement en cours de sé",
      )
      .getByText("Oui")
      .click();
    await page
      .getByRole("textbox", { name: "Décrivez ce protocole Minimum" })
      .click();
    await page
      .getByRole("textbox", { name: "Décrivez ce protocole Minimum" })
      .fill("Description protocole");
    await page.getByLabel("Existe-t-il une fiche de").getByText("Non").click();
    await page
      .getByLabel("Existe-t-il un protocole d’é")
      .getByText("Oui")
      .click();
    await page
      .getByRole("textbox", { name: "Décrivez ce protocole" })
      .nth(1)
      .click();
    await page
      .getByRole("textbox", { name: "Décrivez ce protocole" })
      .nth(1)
      .fill("protocole évacuation");

    await page
      .getByLabel(
        "Existe-t-il un protocole en cas de chute, d’intoxication (alimentaire, mé",
      )
      .getByText("Oui")
      .click();
    await page
      .getByRole("textbox", { name: "Décrivez ce protocole" })
      .nth(2)
      .click();
    await page
      .getByRole("textbox", { name: "Décrivez ce protocole" })
      .nth(2)
      .fill("protocole chute");

    await page
      .getByLabel(
        "Existe-t-il un protocole en cas de réorientation (inadaptation des conditions g",
      )
      .getByText("Non")
      .click();
    await page
      .getByLabel("Existe-t-il un protocole en cas d’alerte canicule ?")
      .getByText("Non")
      .click();
    await page
      .getByRole("textbox", { name: "Précisez les conditions pré" })
      .click();
    await page
      .getByRole("textbox", { name: "Précisez les conditions pré" })
      .fill("A voir sur place");
    await page.getByRole("button", { name: "Suivant" }).click();
    await page.getByRole("button", { name: "Finaliser la fiche" }).click();
    await expect(page.getByText("Fiche organisateur finalisée")).toBeVisible();
  });
});
