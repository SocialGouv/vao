import { test, expect, Page } from "@playwright/test";
import {
  alertLocator,
  basicAlertLocator,
  initTests,
  loginBo,
  loginUsagers,
} from "./utils/helper";
import { agentsRegionalIDF } from "./utils/users";

test.describe.serial("Création de compte OVA - Personne physique", () => {
  let validationPage: Page;
  const { username, password, appUsagersUrl, appBoUrl, maildevUrl } =
    initTests();

  test("Étape 1 — Création de la demande de compte", async ({ page }) => {
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
    console.log("Validation de la demande");
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
    await page
      .getByRole("button", { name: "Ajouter une copie de votre" })
      .click();
  });
});

/*
test("create_organisateur", async ({ page }) => {
  // login
  await page.goto(`${getUrl()}`);
  await login(page);

  await page.getByRole("link", { name: "Organisateur", exact: true }).click();

  // étape 1
  await page.getByText("Personne physique").click();
  await page.getByLabel("Numéro SIRET du titulaire de l’agrément VAO").click();
  await page
    .getByLabel("Numéro SIRET du titulaire de l’agrément VAO")
    .fill("79407263700042");
  await page
    .getByRole("button", {
      name: "Récupérer les informations de la personne physique",
    })
    .click();
  await page.waitForSelector('[aria-label="Profession"]', { state: "visible" });
  await page
    .getByLabel("Profession")
    .selectOption("Agriculture, sylviculture et pêche");
  await page.getByLabel("numéro de téléphone Veuillez").click();
  await page.getByLabel("numéro de téléphone Veuillez").fill("0123456789");
  await page.getByRole("button", { name: "Rue Mirabeau 75016 Paris" }).click();
  await page.getByText("Oui").click();
  await page.getByRole("button", { name: "Suivant" }).click();

  // étape 2
  await page.getByText("Numéro d’agrément figurant").click();
  await page.getByLabel("Numéro d'agrément “Vacances").fill("AGR.001-2024-001");
  await page.getByLabel("Date d'obtention de l'agré").fill("2024-06-01");
  await page.getByLabel("Région d’obtention de l’agré").selectOption("IDF");
  await page.getByLabel("Ajouter une copie de votre").click();
  await page
    .getByLabel("Ajouter une copie de votre")
    .setInputFiles(path.join(__dirname, "data", "agrement.pdf"));
  await page.getByRole("button", { name: "Suivant" }).click();

  // étape 3
  await page.getByText("Les vacanciers viennent par").click();
  await page.getByLabel("Qui est responsable du").click();
  await page.getByText("Les vacanciers viennent par").click();
  await page.getByText("Non", { exact: true }).click();
  await page.getByRole("button", { name: "Suivant" }).click();

  // étape 4
  await page.getByLabel("Des dispositions d’ordre").getByText("Non").click();
  await page.getByLabel("Un accord est-il passé avec").getByText("Non").click();
  await page.getByLabel("Présence d’une trousse à").getByText("Oui").click();
  await page.getByText("Responsable du séjour").click();
  await page.getByLabel("Précisez le rôle des").click();
  await page.getByLabel("Précisez le rôle des").fill("responsable séjour");
  await page
    .getByLabel("Stockage des médicaments dans")
    .getByText("Oui")
    .click();
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
    .getByText("Non")
    .click();
  await page.getByLabel("Existe-t-il une fiche de").getByText("Non").click();
  await page
    .getByLabel("Existe-t-il un protocole d’é")
    .getByText("Non")
    .click();
  await page
    .getByLabel(
      "Existe-t-il un protocole en cas de chute, d’intoxication (alimentaire, mé",
    )
    .getByText("Non")
    .click();
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
  await page.getByLabel("Précisez les conditions pré").click();
  await page.getByLabel("Précisez les conditions pré").fill("budget");
  await page.getByRole("button", { name: "Suivant" }).click();

  // étape 5
  await page.getByRole("button", { name: "Finaliser la fiche" }).click();

  // TODO: next line is commented because it is flaky. I think there is a problem underneath
  // that prevents finalization to happen sometimes.
  // await expect(page.getByText("Fiche organisateur finalisée")).toBeVisible({
  //  timeout: 10000,
  // });

});
*/
