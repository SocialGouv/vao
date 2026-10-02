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
  });
});
