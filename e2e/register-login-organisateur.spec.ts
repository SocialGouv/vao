import { test, expect } from "@playwright/test";
import { randomUUID } from "crypto";
import path from "path";

const baseUrl =
  process.env.E2E_BASE_URL || "vao-main.ovh.fabrique.social.gouv.fr";

const username = process.env.E2E_USERNAME || `e2e-${randomUUID()}@test.com`;
const password = "Pizza1234567;";

// Run tests in serial mode because they are dependant on each other
test.describe.configure({ mode: "serial" });

function getUrl(prefix?: string) {
  return `https://${prefix ? prefix + "-" : ""}${baseUrl}`;
}

async function login(page) {
  await page.getByLabel("Identifiant *Format attendu").click();
  await page.getByLabel("Identifiant *Format attendu").fill(username);
  await page.getByLabel("Mot de passe * Afficher mot").click();
  await page.getByLabel("Mot de passe * Afficher mot").fill(password);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByText("Bienvenue PrénomTest NomTest")).toBeVisible();
}

test("register_and_login", async ({ page }) => {
  // register
  await page.goto(`${getUrl()}/connexion`);
  await expect(page.getByText("Connexion à VAO")).toBeVisible();

  await page.getByRole("button", { name: "Créer un compte" }).click();
  await page.getByPlaceholder("Veuillez saisir votre email").click();
  await page.getByPlaceholder("Veuillez saisir votre email").fill(username);
  await page.getByLabel("Mot de passe Veuillez saisir").click();
  await page.getByLabel("Mot de passe Veuillez saisir").fill(password);
  await page.getByLabel("Confirmation mot de passe").click();
  await page.getByLabel("Confirmation mot de passe").fill(password);
  await page.getByLabel("Nom Veuillez saisir votre nom").click();
  await page.getByLabel("Nom Veuillez saisir votre nom").fill("NomTest");
  await page.getByLabel("Prénom Veuillez saisir votre").click();
  await page.getByLabel("Prénom Veuillez saisir votre").fill("PrénomTest");
  await page.getByLabel("Numéro de téléphone Veuillez").click();
  await page.getByLabel("Numéro de téléphone Veuillez").fill("0123456789");
  await page.getByRole("button", { name: "Créer mon compte" }).click();
  await expect(
    page.getByText("Félicitations, votre compte a bien été créé !"),
  ).toBeVisible();

  // validate email
  await page.goto(`${getUrl("maildev")}/#/`);
  await page
    .getByRole("link", {
      name: `Portail VAO - Validez votre adresse courriel To: ${username}`,
    })
    .click();
  const page2Promise = page.waitForEvent("popup");
  await page
    .locator("iframe")
    .first()
    .contentFrame()
    .getByRole("link", { name: "Je valide mon adresse courriel" })
    .click();

  // login
  const page2 = await page2Promise;
  await login(page2);
});

test("create_organisateur", async ({ page }) => {
  // login
  await page.goto(`${getUrl()}`);
  await login(page);

  await page.getByRole("link", { name: "Organisateur", exact: true }).click();

  // étape 1
  await page.getByText("Personne physique").click();
  await page.getByLabel("Nom de naissance Veuillez").click();
  await page.getByLabel("Nom de naissance Veuillez").fill("NomTest");
  await page.getByLabel("Prénom Veuillez saisir votre").click();
  await page.getByLabel("Prénom Veuillez saisir votre").fill("PrénomTest");
  await page
    .getByLabel("Profession")
    .selectOption("Agriculture, sylviculture et pêche");
  await page.getByLabel("numéro de téléphone Veuillez").click();
  await page.getByLabel("numéro de téléphone Veuillez").fill("0123456789");
  await page.locator('input[type="text"]').click();
  await page.locator('input[type="text"]').fill("Rue Mirabeau 75016 Paris");
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
  await expect(page.getByText("Fiche organisateur finalisée")).toBeVisible();
});
