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
        descriptif: null,
        nomSiteOfficiel,
      },
      client,
    );
    return siteId;
  } finally {
    client.release();
  }
};

const linkOrganismeWithType = async (
  organismeId: number,
  siteId: string,
  hebergementTypeValue: string | null,
): Promise<void> => {
  const client = await getPool().connect();
  try {
    await HebergementServiceShared.createSiteOrganisme(client, {
      deplacementProximiteDescription: null,
      descriptif: null,
      excursionDescription: null,
      hebergementTypeValue,
      nomSite: null,
      organismeId,
      respEmail: null,
      respNomPrenom: null,
      respTelephone: null,
      siteId,
      vehiculesAdaptes: null,
    });
  } finally {
    client.release();
  }
};

const buildBody = (
  siteId: string,
  organismeId: number,
  hebergementTypeValue: string,
) => ({ hebergementTypeValue, organismeId, siteId });

beforeAll(async () => {
  await createTestContainer();
});

beforeEach(async () => {
  const client = await getPool().connect();
  try {
    await client.query(`DELETE FROM front.site_organisme`);
    await client.query(`DELETE FROM front.site`);
  } finally {
    client.release();
  }
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /hebergement/site/type-hebergement-control", () => {
  it("retourne 400 si le body est invalide", async () => {
    authUser = await createUsagersUser();
    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/type-hebergement-control")
      .send({ siteId: "x" });

    expect(response.status).toBe(400);
  });

  it("ne signale pas d'incohérence quand le type saisi correspond à celui déclaré par un autre organisme", async () => {
    authUser = await createUsagersUser();
    const otherUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const otherOrganismeId = await createOrganisme({ userId: otherUser.id });
    const siteId = await createSite(
      authUser.id,
      "Gîte des Pins",
      "134 rue Gilles de Montal, 67730 La Vancelle",
    );
    await linkOrganismeWithType(otherOrganismeId, siteId, "hotel");

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/type-hebergement-control")
      .send(buildBody(siteId, organismeId, "hotel"));

    expect(response.status).toBe(200);
    expect(response.body.incoherence).toBe(false);
    expect(response.body.typeDeclare).toBeNull();
  });

  it("signale une incohérence quand un type différent est déclaré par un autre organisme pour le même lieu", async () => {
    authUser = await createUsagersUser();
    const otherUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const otherOrganismeId = await createOrganisme({ userId: otherUser.id });
    const siteId = await createSite(
      authUser.id,
      "Gîte des Pins",
      "134 rue Gilles de Montal, 67730 La Vancelle",
    );
    await linkOrganismeWithType(otherOrganismeId, siteId, "hotel");

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/type-hebergement-control")
      .send(buildBody(siteId, organismeId, "camping"));

    expect(response.status).toBe(200);
    expect(response.body.incoherence).toBe(true);
    expect(response.body.typeDeclare).toBe("hotel");
  });

  it("ne signale pas d'incohérence quand aucun type n'est déclaré pour le lieu par un autre organisme", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const siteId = await createSite(
      authUser.id,
      "Gîte sans type",
      "4 rue des Acacias, 67730 La Vancelle",
    );

    const response = await request(getFoAppHelper(authUser))
      .post("/hebergement/site/type-hebergement-control")
      .send(buildBody(siteId, organismeId, "camping"));

    expect(response.status).toBe(200);
    expect(response.body.incoherence).toBe(false);
    expect(response.body.typeDeclare).toBeNull();
  });
});
