import request from "supertest";

import { HebergementServiceShared } from "../../shared/hebergements/hebergements.service";
import { getPool } from "../../utils/pgpool";
import { getFoAppHelper } from "../helpers/appHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

let authUser = { email: "", id: 0, role: "admin" };

const createSite = async (
  userId: number,
  organismeId: number,
  nomSiteOfficiel: string,
  label: string,
): Promise<string> => {
  const client = await getPool().connect();
  try {
    const { siteId } = await HebergementServiceShared.createSite(
      {
        adresse: {
          cleInsee: null,
          codeInsee: "12345",
          codePostal: "67730",
          coordinates: [7.72, 48.33],
          departement: "67",
          label,
        },
        adresseId: null,
        createdBy: userId,
        deplacementProximiteDescription: null,
        descriptif: null,
        excursionDescription: null,
        hebergementTypeId: null,
        hebergementTypeValue: null,
        nomSiteOfficiel,
        organismeId,
        respEmail: null,
        respNomPrenom: null,
        respTelephone: null,
        vehiculesAdaptes: null,
      },
      client,
    );
    return siteId;
  } finally {
    client.release();
  }
};

const buildAdresse = (label: string) => ({
  cleInsee: "74079_0760",
  codeInsee: "74079",
  codePostal: "67730",
  coordinates: [7.72, 48.33],
  departement: "67",
  label,
});

const buildBody = (overrides: Record<string, unknown> = {}) => {
  const { adresse: adresseOverride, ...rest } = overrides;
  const adresse = adresseOverride as { label?: string } | undefined;
  const label = adresse?.label ?? "134 rue Gilles de Montal, 67730 La Vancelle";
  return {
    nomSiteOfficiel: "Gîte des Pins",
    ...rest,
    adresse: buildAdresse(label),
  };
};

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /hebergement/site/similarites", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/similarites")
      .send({ adresse: null, nomSiteOfficiel: null });

    expect(response.status).toBe(400);
  });

  it("retourne une liste vide quand aucune similitude n'est trouvée", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    await createSite(
      authUser.id,
      organismeId,
      "Gîte distant",
      "5 avenue des Champs, 75001 Paris",
    );

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/similarites")
      .send(buildBody());

    expect(response.status).toBe(200);
    expect(response.body.similarites).toEqual([]);
  });

  it("accepte un body sans nomSiteOfficiel (statut BROUILLON / route de check)", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    await createSite(
      authUser.id,
      organismeId,
      "Gîte distant",
      "5 avenue des Champs, 75001 Paris",
    );

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/similarites")
      .send({
        adresse: buildAdresse("134 rue Gilles de Montal, 67730 La Vancelle"),
      });

    expect(response.status).toBe(200);
  });

  it("détecte un numéro de voie différent d'un autre site", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    await createSite(
      authUser.id,
      organismeId,
      "Gîte voisin",
      "135 rue Gilles de Montal, 67730 La Vancelle",
    );

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/similarites")
      .send(buildBody());

    expect(response.status).toBe(200);
    expect(response.body.similarites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          adresse: expect.objectContaining({
            label: "135 rue Gilles de Montal, 67730 La Vancelle",
          }),
          nomSiteOfficiel: "Gîte voisin",
          similarite: "numeroVoie",
        }),
      ]),
    );
  });

  it("détecte un type de voie différent d'un autre site", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    await createSite(
      authUser.id,
      organismeId,
      "Gîte voisin",
      "12 chemin des Prés, 67730 La Vancelle",
    );

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/similarites")
      .send(
        buildBody({
          adresse: { label: "12 avenue des Prés, 67730 La Vancelle" },
        }),
      );

    expect(response.status).toBe(200);
    expect(response.body.similarites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          adresse: expect.objectContaining({
            label: "12 chemin des Prés, 67730 La Vancelle",
          }),
          nomSiteOfficiel: "Gîte voisin",
          similarite: "typeVoie",
        }),
      ]),
    );
  });

  it("détecte plusieurs noms de lieux à la même adresse", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    await createSite(
      authUser.id,
      organismeId,
      "Gîte Les Libellules",
      "1 rue des Libellules, 67730 La Vancelle",
    );
    await createSite(
      authUser.id,
      organismeId,
      "Domaine des Libellules",
      "1 rue des Libellules, 67730 La Vancelle",
    );

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/similarites")
      .send(
        buildBody({
          adresse: { label: "1 rue des Libellules, 67730 La Vancelle" },
          nomSiteOfficiel: "Les Libellules",
        }),
      );

    expect(response.status).toBe(200);
    expect(response.body.similarites).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nomSiteOfficiel: "Domaine des Libellules",
          similarite: "nomLieu",
        }),
        expect.objectContaining({
          nomSiteOfficiel: "Gîte Les Libellules",
          similarite: "nomLieu",
        }),
      ]),
    );
  });
});
