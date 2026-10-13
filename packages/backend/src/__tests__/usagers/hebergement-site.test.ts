import request from "supertest";

import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import { withTransaction } from "../../utils/pgpool";
import { getFoAppHelper } from "../helpers/appHelper";
import { createDocument } from "../helpers/documentHelper";
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

const buildUniteBody = (overrides: object = {}, includeCollections = true) => ({
  accessibilitePmr: true,
  accessibilitePrecision: null,
  amenagementsSpecifiques: false,
  amenagementsSpecifiquesPrecision: null,
  chambresDoubles: false,
  complementLocalisation: "Bâtiment A",
  couchageIndividuel: true,
  fileDernierArreteAutorisationMaire: null,
  fileDerniereAttestationSecurite: null,
  fileReponseExploitantOuProprietaire: null,
  litsSuperposes: false,
  nombreChambreTotal: 4,
  nombreCouchageTotal: 8,
  ...(includeCollections
    ? {
        prestationsHotelieres: ["blanchisseries", "entretien_locaux"],
        typePensions: ["demi_pension", "pension_complete"],
      }
    : {}),
  rangementIndividuel: true,
  reglementationErp: false,
  separationHommeFemme: true,
  visiteLocaux: null,
  visiteLocauxAt: null,
  ...overrides,
});

const createSiteForUser = async () => {
  const user = await createUsagersUser();
  const organismeId = await createOrganisme({ userId: user.id });
  const response = await request(getFoAppHelper(user))
    .post("/hebergement/site")
    .send(
      buildBody(organismeId, {
        adresse: buildAdresse(`134 rue Gilles de Montal, ${user.id}`),
        nomSite: `Gîte des Pins ${user.id}`,
        nomSiteOfficiel: `Gîte des Pins ${user.id}`,
      }),
    );

  expect(response.status).toBe(201);
  return { organismeId, siteId: response.body.siteId as string, user };
};

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

    const link = await withTransaction(async (tx) =>
      HebergementServiceShared.getSiteOrganisme(
        tx,
        second.body.siteId,
        organismeId,
      ),
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

describe("GET /hebergement/site/:siteId", () => {
  it("retourne 400 si organismeId est absent du query", async () => {
    authUser = await createUsagersUser();

    const response = await request(getFoAppHelper(authUser)).get(
      "/hebergement/site/some-site-id",
    );

    expect(response.status).toBe(400);
  });

  it("retourne 403 si l'utilisateur n'est pas lié à l'organisme", async () => {
    authUser = await createUsagersUser();
    const otherUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: otherUser.id });

    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/site/some-site-id?organismeId=${organismeId}`,
    );

    expect(response.status).toBe(403);
  });

  it("retourne le site lié à l'organisme de l'utilisateur avec son adresse", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });

    const { body } = await request(getFoAppHelper(authUser))
      .post("/hebergement/site")
      .send(buildBody(organismeId));
    expect(body.siteId).toBeDefined();

    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/site/${body.siteId}?organismeId=${organismeId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.site).not.toBeNull();
    expect(response.body.site.siteId).toBe(body.siteId);
    expect(response.body.site.organismeId).toBe(organismeId);
    expect(response.body.site.nomSite).toBe("Gîte des Pins");
    expect(response.body.site.nomSiteOfficiel).toBe("Gîte des Pins");
    expect(response.body.site.adresse?.label).toBe(
      "134 rue Gilles de Montal, 67730 La Vancelle",
    );
    expect(response.body.unitesHebergement).toEqual([]);
  });

  it("retourne null si le site n'appartient pas à l'organisme", async () => {
    authUser = await createUsagersUser();
    const ownerUser = await createUsagersUser();
    const ownerOrganismeId = await createOrganisme({ userId: ownerUser.id });

    const { body } = await request(getFoAppHelper(ownerUser))
      .post("/hebergement/site")
      .send(buildBody(ownerOrganismeId));
    expect(body.siteId).toBeDefined();

    const userOrganismeId = await createOrganisme({ userId: authUser.id });
    const response = await request(getFoAppHelper(authUser)).get(
      `/hebergement/site/${body.siteId}?organismeId=${userOrganismeId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.site).toBeNull();
    expect(response.body.unitesHebergement).toEqual([]);
  });
});

describe("POST /hebergement/site/:siteId/unites", () => {
  it("crée une unité et enrichit ses fichiers dans la réponse et le GET du site", async () => {
    const { user, organismeId, siteId } = await createSiteForUser();
    const [fileArrete, fileAttestation, fileNonAssujettissement] =
      await Promise.all([
        createDocument({ userId: user.id }),
        createDocument({ userId: user.id }),
        createDocument({ userId: user.id }),
      ]);

    const response = await request(getFoAppHelper(user))
      .post(`/hebergement/site/${siteId}/unites`)
      .send({
        organismeId,
        ...buildUniteBody({
          fileDernierArreteAutorisationMaire: fileArrete,
          fileDerniereAttestationSecurite: fileAttestation,
          fileReponseExploitantOuProprietaire: fileNonAssujettissement,
        }),
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.siteId).toBe(siteId);
    expect(response.body.typePensions).toEqual([
      "demi_pension",
      "pension_complete",
    ]);
    expect(response.body.prestationsHotelieres).toEqual([
      "blanchisseries",
      "entretien_locaux",
    ]);
    expect(response.body.fileDernierArreteAutorisationMaire).toBe(fileArrete);
    expect(response.body.fileDerniereAttestationSecurite).toBe(fileAttestation);
    expect(response.body.fileReponseExploitantOuProprietaire).toBe(
      fileNonAssujettissement,
    );

    const siteResponse = await request(getFoAppHelper(user)).get(
      `/hebergement/site/${siteId}?organismeId=${organismeId}`,
    );

    expect(siteResponse.status).toBe(200);
    expect(siteResponse.body.unitesHebergement).toHaveLength(1);
    expect(siteResponse.body.unitesHebergement[0]).toMatchObject({
      fileDernierArreteAutorisationMaire: {
        name: "document.pdf",
        uuid: fileArrete,
      },
      fileDerniereAttestationSecurite: {
        name: "document.pdf",
        uuid: fileAttestation,
      },
      fileReponseExploitantOuProprietaire: {
        name: "document.pdf",
        uuid: fileNonAssujettissement,
      },
      id: response.body.id,
    });
  });
});

describe("PATCH /hebergement/site/:siteId/unites/:uniteId", () => {
  it("met à jour l'unité en place et conserve les listes absentes du body", async () => {
    const { user, organismeId, siteId } = await createSiteForUser();
    const created = await request(getFoAppHelper(user))
      .post(`/hebergement/site/${siteId}/unites`)
      .send({ organismeId, ...buildUniteBody() });

    expect(created.status).toBe(201);

    const updated = await request(getFoAppHelper(user))
      .patch(`/hebergement/site/${siteId}/unites/${created.body.id}`)
      .query({ organismeId })
      .send(buildUniteBody({ nombreCouchageTotal: 12 }, false));

    expect(updated.status).toBe(200);
    expect(updated.body.id).toBe(created.body.id);

    const siteResponse = await request(getFoAppHelper(user)).get(
      `/hebergement/site/${siteId}?organismeId=${organismeId}`,
    );

    expect(siteResponse.status).toBe(200);
    expect(siteResponse.body.unitesHebergement).toHaveLength(1);
    expect(siteResponse.body.unitesHebergement[0]).toMatchObject({
      id: created.body.id,
      nombreCouchageTotal: 12,
      prestationsHotelieres: ["blanchisseries", "entretien_locaux"],
      typePensions: ["demi_pension", "pension_complete"],
    });
  });
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

    const organismeLink = await withTransaction(async (tx) =>
      HebergementServiceShared.getSiteOrganisme(tx, body.siteId, organismeId),
    );
    expect(organismeLink).not.toBeNull();
    expect(organismeLink?.descriptif).toBe("Un gîte confortable et accessible");
    expect(organismeLink?.hebergementTypeId).not.toBeNull();
    expect(organismeLink?.respNomPrenom).toBe("DUPONT Nicolas");
    expect(organismeLink?.respTelephone).toBe("0612345678");
    expect(organismeLink?.respEmail).toBe("resp@example.fr");
  });
});
