import request from "supertest";

import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import { getFoAppHelper } from "../helpers/appHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

let authUser = { email: "", id: 0, role: "admin" };

const buildAdresse = (
  label = "134 rue Gilles de Montal, 67730 La Vancelle",
) => ({
  cleInsee: "74079_0760",
  codeInsee: "74079",
  codePostal: "67730",
  coordinates: [7.72, 48.33],
  departement: "67",
  label,
});

const buildBody = (organismeId: number, overrides: object = {}) => ({
  adresse: buildAdresse(),
  nomSite: "Gîte des Pins",
  nomSiteOfficiel: "Gîte des Pins",
  organismeId,
  ...overrides,
});

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /hebergement/site", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send({ adresse: null, nomSiteOfficiel: null });

    expect(response.status).toBe(400);
  });

  it("retourne 400 si l'adresse sans label est fournie", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId, { adresse: { label: undefined } }));

    expect(response.status).toBe(400);
  });

  it("retourne 403 si l'utilisateur n'est pas lié à l'organisme", async () => {
    authUser = await createUsagersUser();
    const otherUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: otherUser.id });

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));

    expect(response.status).toBe(403);
  });

  it("crée un site et retourne son siteId", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));

    expect(response.status).toBe(201);
    expect(response.body.siteId).toBeDefined();

    const site = await HebergementServiceShared.getSiteById(
      response.body.siteId,
    );
    expect(site).not.toBeNull();
    expect(site?.nomSiteOfficiel).toBe("Gîte des Pins");
    expect(site?.createdBy).toBe(authUser.id);

    expect(response.body.organismeId).toBe(organismeId);
    expect(response.body.nomSite).toBe("Gîte des Pins");
    expect(response.body.adresseId).toBe(site?.adresseId);
  });

  it("renvoie les données du site et du lien organisme même quand le site est réutilisé", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });

    const first = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));
    expect(first.status).toBe(201);

    const second = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));

    expect(second.status).toBe(201);
    expect(second.body.siteId).toBe(first.body.siteId);
    expect(second.body.organismeId).toBe(organismeId);
    expect(second.body.nomSite).toBe("Gîte des Pins");
  });

  it("réutilise le site existant quand le nom officiel et l'adresse correspondent", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });

    const first = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));
    expect(first.status).toBe(201);

    const second = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));

    expect(second.status).toBe(201);
    expect(second.body.siteId).toBe(first.body.siteId);

    const link = await HebergementServiceShared.getSiteOrganisme(
      second.body.siteId,
      organismeId,
    );
    expect(link).not.toBeNull();
  });

  it("crée un nouveau site quand seul le nom officiel diffère", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });

    const first = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId, { nomSiteOfficiel: "Gîte des Pins" }));
    expect(first.status).toBe(201);

    const second = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId, { nomSiteOfficiel: "Gîte des Épines" }));

    expect(second.status).toBe(201);
    expect(second.body.siteId).not.toBe(first.body.siteId);
  });
});

const buildPatchBody = (organismeId: number, overrides: object = {}) => ({
  description: "Un gîte confortable et accessible",
  hebergementTypeValue: "hotel",
  organismeId,
  responsable: {
    email: "resp@example.fr",
    nomPrenom: "DUPONT Nicolas",
    telephone: "0612345678",
  },
  ...overrides,
});

describe("PATCH /hebergement/site/:siteId", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();

    const response = await request(getFoAppHelper(authUser))
      .patch("/hebergement/site/some-site-id")
      .send({ description: "sera rejeté car organismeId manquant" });

    expect(response.status).toBe(400);
  });

  it("retourne 404 si le site ne dépend pas de l'organisme de l'utilisateur", async () => {
    authUser = await createUsagersUser();
    const ownerUser = await createUsagersUser();
    const ownerOrganismeId = await createOrganisme({ userId: ownerUser.id });

    const { body } = await request(getFoAppHelper(ownerUser))
      .post("/hebergement/site")
      .send(buildBody(ownerOrganismeId));
    expect(body.siteId).toBeDefined();

    const userOrganismeId = await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser))
      .patch(`/hebergement/site/${body.siteId}`)
      .send(buildPatchBody(userOrganismeId));

    expect(response.status).toBe(404);
  });

  it("met à jour le site et le site_organisme", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });

    const { body } = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));
    expect(body.siteId).toBeDefined();

    const response = await request(getFoAppHelper(authUser))
      .patch(`/hebergement/site/${body.siteId}`)
      .send(buildPatchBody(organismeId));

    expect(response.status).toBe(200);

    const site = await HebergementServiceShared.getSiteById(body.siteId);
    expect(site?.descriptif).toBe("Un gîte confortable et accessible");
    expect(site?.hebergementTypeId).not.toBeNull();

    const organismeLink = await HebergementServiceShared.getSiteOrganisme(
      body.siteId,
      organismeId,
    );
    expect(organismeLink).not.toBeNull();
    expect(organismeLink?.respNomPrenom).toBe("DUPONT Nicolas");
    expect(organismeLink?.respTelephone).toBe("0612345678");
    expect(organismeLink?.respEmail).toBe("resp@example.fr");
  });
});
