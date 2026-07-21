import * as Sentry from "@sentry/node";
import {
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AGREMENT_SVA_TIMER_STATUT,
  AGREMENT_TYPE_DEPOT,
  ERRORS_COMMON,
  FILE_CATEGORY,
  formatFR,
  ORGANISME_TYPE,
  USER_TYPE,
} from "@vao/shared-bridge";
import request from "supertest";

import { AgrementsRepository as AgrementsRepositoryAdmin } from "../../admin/agrements/agrements.repository";
import { AgrementService as AgrementServiceAdmin } from "../../admin/agrements/agrements.service";
import * as DocumentService from "../../services/Document";
import insee, { getEtablissement } from "../../services/Insee";
import { mailService } from "../../services/mail";
import { AgrementsRepository } from "../../usagers/agrements/agrements.repository";
import { AgrementService } from "../../usagers/agrements/agrements.service";
import { buildAgrementFixture } from "../fixtures/agrementsFixture";
import { createAgrement, getAgrement } from "../helpers/agrementsHelper";
import { createAgrementMessage } from "../helpers/agrementsMessageHelper";
import { getFoAppHelper } from "../helpers/appHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import { createTerritoire } from "../helpers/territoireHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createAdminUser, createUsagersUser } from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));
jest.mock("../../services/Insee", () => ({
  getEtablissement: jest.fn(),
}));

const mockedGetEtablissement = getEtablissement as jest.Mock;

beforeAll(async () => await createTestContainer());
afterAll(async () => await removeTestContainer());

beforeEach(() => {
  jest.resetAllMocks();
  mockedGetEtablissement.mockReset();
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("GET /agrements/", () => {
  it("devrait retourner une liste d'agréments lié à l'utilisateur connecté", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser)).get(
      `/agrements/`,
    );

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrements).not.toBeNull();
    expect(response.body.agrements[0].id).toEqual(agrementId);

    const agrementById = await AgrementsRepository.getById({
      agrementId,
      withDetails: true,
    });
    expect(agrementById?.id).toEqual(agrementId);
  });
  it("devrait retourner une liste avec un agrement valide à l'utilisateur connecté", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData1 = await buildAgrementFixture({ organismeId });
    await createAgrement({
      agrement: agrementData1,
      organismeId,
    });
    const agrementData2 = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.VALIDE,
    });
    const agrementId2 = await createAgrement({
      agrement: agrementData2,
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser)).get(
      `/agrements?statut=VALIDE`,
    );

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrements).not.toBeNull();
    expect(response.body.agrements[0].id).toEqual(agrementId2);
  });

  it("retourne 400 si le filtre statut est invalide", async () => {
    const frontUser = await createUsagersUser();
    const response = await request(getFoAppHelper(frontUser)).get(
      `/agrements?statut=STATUT_INVALIDE`,
    );

    expect(response.status).toBe(400);
    expect(response.body.name).toBe(ERRORS_COMMON.INVALID_QUERY);
  });
});

describe("GET /agrements/:agrementId", () => {
  it("devrait retourner un agrément", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser)).get(
      `/agrements/${agrementId}`,
    );

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.agrement).not.toBeNull();
    expect(response.body.agrement.id).toEqual(agrementId);
  });

  it("devrait retourner un agrément introuvable", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser)).get(
      `/agrements/invalid`,
    );

    expect(response.status).toBe(400);
  });
  it("devrait retourner un agrement introuvable", async () => {
    const frontUser = await createUsagersUser();
    const response = await request(getFoAppHelper(frontUser)).get(
      `/agrements/123456789`,
    );

    // Vérification des résultats
    expect(response.status).toBe(404);
  });
});

describe("POST /agrements", () => {
  it("devrait créer un agrément sans bilan annuel", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    // On force agrementBilanAnnuel à []
    const agrementData = await buildAgrementFixture({
      agrementBilanAnnuel: [],
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  it("devrait retourner 200 et créer un agrément sans bilan annuel", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    // On force agrementBilanAnnuel à []
    const agrementData = await buildAgrementFixture({
      agrementBilanAnnuel: [],
      organismeId,
    });

    const responseBrouillon = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({ ...agrementData, typeDepot: AGREMENT_TYPE_DEPOT.PREMIER });

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: responseBrouillon.body.id,
        statut: AGREMENT_STATUT.TRANSMIS,
        typeDepot: AGREMENT_TYPE_DEPOT.PREMIER,
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("devrait remonter une 200 avec ma region d'obtention", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({
      organisme: { siret: "93828857800017" },
      userId: frontUser.id,
    });

    mockedGetEtablissement.mockResolvedValue({
      adresseEtablissement: {
        codeCommuneEtablissement: "75001",
      },
    });
    // On force agrementBilanAnnuel à [] car c'est un premier agréménet, donc pas de bilan annuel
    const agrementData = await buildAgrementFixture({
      agrementBilanAnnuel: [],
      organismeId,
    });
    // région inexistante (correspond au premier agrément)
    agrementData.regionObtention = null;

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();

    const { agrement } = await getAgrement(response.body.id);
    expect(agrement?.regionObtention).toBe("IDF");
  });

  it("devrait remonter une erreur 400 avec ma region d'obtention introuvable", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({
      userId: frontUser.id,
    });

    mockedGetEtablissement.mockResolvedValue({
      adresseEtablissement: {
        codeCommuneEtablissement: "00001",
      },
    });
    // On force agrementBilanAnnuel à [] car c'est un premier agréménet, donc pas de bilan annuel
    const agrementData = await buildAgrementFixture({
      agrementBilanAnnuel: [],
      organismeId,
    });
    agrementData.regionObtention = null;
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(agrementData);

    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });
  it("devrait retourner 400 si aucune région n'est trouvée pour le code INSEE", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    // On force agrementBilanAnnuel à []
    const agrementData = await buildAgrementFixture({
      agrementBilanAnnuel: [],
      organismeId,
      regionObtention: "", // région inexistante
    });
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(agrementData);

    expect(response.status).toBe(400);
    expect(response.body).toBeDefined();
  });
  it("devrait retourner 502 si l'API INSEE échoue", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });

    // Simule une panne API INSEE
    (insee.getEtablissement as jest.Mock).mockRejectedValue(
      new Error("INSEE API down"),
    );

    const agrementData = await buildAgrementFixture({
      agrementBilanAnnuel: [],
      organismeId,
      regionObtention: "",
    });

    const response = await request(getFoAppHelper(frontUser))
      .post("/agrements/")
      .send(agrementData);

    expect(response.status).toBe(502);

    expect(response.body).toBeDefined();
    expect(response.body.message).toContain(
      "Erreur lors de l'appel à l'API INSEE",
    );
  });
  it("devrait remonter une 422 si SIRET est absent", async () => {
    const frontUser = await createUsagersUser();

    // Organisme sans SIRET
    const organismeId = await createOrganisme({
      organisme: {
        siret: null,
      },
      userId: frontUser.id,
    });

    const agrementData = await buildAgrementFixture({
      agrementBilanAnnuel: [],
      organismeId,
      regionObtention: "", // déclenche le calcul INSEE
    });

    const response = await request(getFoAppHelper(frontUser))
      .post("/agrements/")
      .send(agrementData);

    expect(response.status).toBe(422);

    expect(response.body).toMatchObject({
      message: expect.stringContaining("SIRET introuvable"),
    });
  });
  it("devrait créer un agrément sans animation (coverage)", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    // On force agrementAnimation à []
    const agrementData = await buildAgrementFixture({
      agrementAnimation: [],
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  it("devrait créer un agrément sans séjour", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    // On force agrementSejours à []
    const agrementData = await buildAgrementFixture({
      agrementSejours: [],
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  it("devrait créer un agrément (POST /agrements)", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(agrementData);

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
  it("devrait mettre à jour un agrément (POST /agrements)", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.VALIDE,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const { agrement } = await getAgrement(agrementId);
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({ ...agrement, typeDepot: AGREMENT_TYPE_DEPOT.RENOUVELLEMENT });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("retourne une erreur 404 si l'ancien agrément est introuvable lors de la mise à jour", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });

    // Utilise un id inexistant
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({ ...agrementData, id: 99999999 });

    expect(response.status).toBe(404);
  });

  it("devrait changer le statut d'un agrément avec succès", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });

    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });

    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });

    const agrementId = await createAgrement({
      agrement: { ...agrementData },
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(agrementId);

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.MODIFICATION ||
        event.type_precision === AGREMENT_STATUT.TRANSMIS,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.usager_user).toBeDefined();
    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.TRANSMIS);
    expect(agrement?.dateDepot).not.toBeNull();
    expect(agrement?.dateDepot ? formatFR(agrement?.dateDepot) : null).toBe(
      formatFR(new Date()),
    );
  });

  it("renseigne organismeName et siret pour une personne morale lors de l'envoi du mail à la région", async () => {
    const frontUser = await createUsagersUser();
    const regionEmail = "region-idf@example.com";
    const organismeId = await createOrganisme({
      organisme: {
        raisonSociale: "ACME Corp",
        siret: "12345678900000",
      },
      typeOrganisme: ORGANISME_TYPE.PERSONNE_MORALE,
      userId: frontUser.id,
    });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    await createTerritoire({
      territoire: { service_mail: regionEmail },
      territoireCode: "IDF",
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(response.status).toBe(200);

    // Vérifie que le mail envoyé à la région contient la raison sociale et le siret
    const calls = (mailService.send as jest.Mock).mock.calls;
    const mailToRegion = calls.find((call) => {
      const to = call[0].to || call[0].email;
      return to && to.endsWith("@territoire.com");
    });
    expect(mailToRegion).toBeDefined();
    expect(mailToRegion[0].html).toContain("ACME Corp");
    expect(mailToRegion[0].html).toContain("12345678900000");
  });
  it("renseigne organismeName pour une personne physique lors de l'envoi du mail à la région", async () => {
    const frontUser = await createUsagersUser();
    const regionEmail = "region-idf@example.com";
    const organismeId = await createOrganisme({
      organisme: {
        nom: "Dupont",
        nomNaissance: "Dupont",
        nomUsage: "Jean Dupont",
        prenom: "Jean",
        siret: null, // override du SIRET random du helper
      },
      typeOrganisme: ORGANISME_TYPE.PERSONNE_PHYSIQUE,
      userId: frontUser.id,
    });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    await createTerritoire({
      territoire: { service_mail: regionEmail },
      territoireCode: "IDF",
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });

    // Vérifie que le mail envoyé à la région contient le nom et prénom de la personne physique
    const calls = (mailService.send as jest.Mock).mock.calls;
    const mailToRegion = calls.find((call) => {
      const to = call[0].to || call[0].email;
      return to && to.endsWith("@territoire.com");
    });
    expect(mailToRegion).toBeDefined();
    expect(mailToRegion[0].html).toContain("Jean Dupont");
    // Pas de siret pour une personne physique
    expect(mailToRegion[0].html).not.toMatch(/\d{14}/); // ou adapte selon le rendu attendu
  });

  it("envoie un mail à la région et à l’usager lors du passage à TRANSMIS", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(2);
    const calls = (mailService.send as jest.Mock).mock.calls;
    expect(calls[0][0]).toHaveProperty("to");
    expect(calls[1][0]).toHaveProperty("to");
    expect(calls.some((call) => call[0].to && call[0].to.includes("@"))).toBe(
      true,
    );
  });

  it("n’envoie pas de mail à la région si la région est inconnue", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "AAA",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const call = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(call).toHaveProperty("to");
    expect(call.html).toMatch(/DREETS compétente/);
  });
  it("log une erreur si l'envoi du mail à la région échoue", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    (mailService.send as jest.Mock)
      .mockImplementationOnce(() => {
        throw new Error("Erreur d'envoi mail région");
      })
      .mockImplementationOnce(() => {}); // usager
    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(2);
  });

  it("log une erreur si l'envoi du mail à l'usager échoue", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    (mailService.send as jest.Mock)
      .mockImplementationOnce(() => {}) // région
      .mockImplementationOnce(() => {
        throw new Error("Erreur d'envoi mail usager");
      });

    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(2);
  });

  it("n’envoie pas de mail à la région si l’email de la région est manquant", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    await createTerritoire({
      territoire: { email: null },
      territoireCode: "IDF",
    });

    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const call = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(call).toHaveProperty("to");
    expect(call.html).toMatch(/DREETS/);
  });

  it("n’envoie pas de mail si l’organisme est introuvable", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const call = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(call).toHaveProperty("to");
    expect(call.html).toMatch(/DREETS/);
  });

  it("envoie un mail à l’usager avec fallback si la région est inconnue", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "AAA",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const call = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(call).toHaveProperty("to");
    expect(call.html).toMatch(/DREETS compétente/);
  });
  it("devrait changer le statut en agrement TRANSMIS après modification", async () => {
    const usagerUser = await createUsagersUser();
    // Ici on répond aux conditions de mise à jour backOffice
    const adminUser = await createAdminUser();
    await createTerritoire({ territoireCode: "IDF" });
    const organismeId = await createOrganisme({ userId: usagerUser.id });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });

    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper(usagerUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(agrementId);

    // Mise à jour côté Admin pour demande de complétion du dossier
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      commentaire:
        "Dossier à compléter car il manque des éléments pour pouvoir le traiter",
      statut: AGREMENT_STATUT.A_COMPLETER,
      territoireCode: agrementData.regionObtention!,
    });
    expect(mailService.send).toHaveBeenCalledTimes(3);

    // Transmission de l'agrément au Service après complétude
    const responseCorrection = await request(getFoAppHelper(usagerUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    const calls = (mailService.send as jest.Mock).mock.calls;
    const mailToRegion = calls[3]; // mail région après renvoi post-A_COMPLETER
    expect(mailToRegion[0].subject).toBe(
      "Portail VAO – Nouvelle demande de renouvellement d'agrément reçue",
    );
    expect(mailToRegion[0].html).toContain(
      "après avoir apporté les modifications demandées",
    );
    expect(mailToRegion[0].html).toContain("Transmis");
    expect(responseCorrection.status).toBe(200);
    expect(responseCorrection.body.id).toBe(agrementId);
    expect(mailService.send).toHaveBeenCalledTimes(5);
    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.TRANSMIS,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.usager_user).toBeDefined();
    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.TRANSMIS);
  });

  it("devrait envoyer le mail 'première demande' à la région après renvoi suite à demande de complément", async () => {
    const usagerUser = await createUsagersUser();
    // Ici on répond aux conditions de mise à jour backOffice
    const adminUser = await createAdminUser();
    await createTerritoire({ territoireCode: "IDF" });
    const organismeId = await createOrganisme({ userId: usagerUser.id });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });

    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper(usagerUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
        typeDepot: AGREMENT_TYPE_DEPOT.PREMIER,
      });

    expect(mailService.send).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(agrementId);

    // Mise à jour côté Admin pour demande de complétion du dossier
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      commentaire:
        "Dossier à compléter car il manque des éléments pour pouvoir le traiter",
      statut: AGREMENT_STATUT.A_COMPLETER,
      territoireCode: agrementData.regionObtention!,
    });
    expect(mailService.send).toHaveBeenCalledTimes(3);

    // Transmission de l'agrément au Service après complétude
    await request(getFoAppHelper(usagerUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
        typeDepot: AGREMENT_TYPE_DEPOT.PREMIER,
      });
    const calls = (mailService.send as jest.Mock).mock.calls;
    const mailToRegion = calls[3];
    expect(mailToRegion[0].subject).toBe(
      "Portail VAO – Nouvelle demande de premier agrément reçue",
    );
    expect(mailToRegion[0].html).toContain(
      "après avoir apporté les modifications demandées",
    );
    expect(mailToRegion[0].html).toContain("1ère demande en cours");
  });

  it("devrait changer le statut en agrement EN_INSTRUCTION après demande de correction", async () => {
    const usagerUser = await createUsagersUser();
    // Ici on répond aux conditions de mise à jour backOffice
    const adminUser = await createAdminUser();
    await createTerritoire({ territoireCode: "IDF" });
    const organismeId = await createOrganisme({ userId: usagerUser.id });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });

    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });

    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper(usagerUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(mailService.send).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(agrementId);

    // Mise à jour côté Admin pour demande de complétion du dossier
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      commentaire:
        "Dossier à compléter car il manque des éléments pour pouvoir le traiter",
      statut: AGREMENT_STATUT.EN_INSTRUCTION,
      territoireCode: agrementData.regionObtention!,
    });
    expect(mailService.send).toHaveBeenCalledTimes(4);

    // Mise à jour côté Admin pour demande de CORRECTION du dossier
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      commentaire:
        "Dossier à corriger car il manque des éléments pour pouvoir le traiter",
      statut: AGREMENT_STATUT.A_CORRIGER,
      territoireCode: agrementData.regionObtention!,
    });
    expect(mailService.send).toHaveBeenCalledTimes(6);
    // Transmission de l'agrément au Service après complétude
    const responseCorrection = await request(getFoAppHelper(usagerUser))
      .post(`/agrements/`)
      .send({
        ...agrementData,
        id: agrementId,
        statut: AGREMENT_STATUT.EN_INSTRUCTION,
      });
    expect(responseCorrection.status).toBe(200);
    expect(responseCorrection.body.id).toBe(agrementId);
    expect(mailService.send).toHaveBeenCalledTimes(7);
    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const completudeEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.EN_INSTRUCTION,
    );

    expect(completudeEvent).toBeDefined();
    expect(completudeEvent?.usager_user).toBeDefined();
    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.EN_INSTRUCTION);

    const svaTimer = await AgrementsRepositoryAdmin.getSvaTimerByStatut({
      agrementId,
      statut: AGREMENT_SVA_TIMER_STATUT.RUNNING,
    });
    expect(svaTimer?.createdAt).toBeDefined();
  });

  it("devrait récupérer l'erreur lorsqu'un agrément est incomplet", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const agrementIncomplet = {
      ...agrementData,
      motivations: "",
    };
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementIncomplet,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });
    expect(response.status).toBe(400);
    expect(response.body.message).toContain("Champ obligatoire");
    expect(response.body.message).toContain("motivations");
    expect(response.body.name).toEqual(ERRORS_COMMON.INVALID_BODY);
  });

  it("devrait retourner un path not found", async () => {
    const frontUser = await createUsagersUser();

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/test`)
      .send({});
    expect(response.status).toBe(404);
    expect(response.body.name).toEqual(ERRORS_COMMON.PATH_NOT_FOUND);
  });
  it("retourne une erreur 400 si une personne morale soumet sans procès verbal lors d'un A_COMPLETER", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({
      organisme: {
        raisonSociale: "ACME Corp",
        siret: "12345678900000",
      },
      typeOrganisme: ORGANISME_TYPE.PERSONNE_MORALE,
      userId: frontUser.id,
    });

    // Création initiale avec procès-verbal pour que createAgrement passe
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    // Soumission sans procès-verbal en statut A_COMPLETER
    const agrementDataWithoutProcVerbal = {
      ...agrementData,
      agrementFiles: (agrementData.agrementFiles ?? []).filter(
        (file) => file.category !== FILE_CATEGORY.PROCVERBAL,
      ),
    };

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementDataWithoutProcVerbal,
        id: agrementId,
        statut: AGREMENT_STATUT.A_COMPLETER,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("procès verbal");
  });

  it("retourne une erreur 400 si une personne morale soumet sans procès verbal lors d'un EN_INSTRUCTION", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({
      organisme: {
        raisonSociale: "ACME Corp",
        siret: "12345678900000",
      },
      typeOrganisme: ORGANISME_TYPE.PERSONNE_MORALE,
      userId: frontUser.id,
    });

    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    const agrementDataWithoutProcVerbal = {
      ...agrementData,
      agrementFiles: (agrementData.agrementFiles ?? []).filter(
        (file) => file.category !== FILE_CATEGORY.PROCVERBAL,
      ),
    };

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementDataWithoutProcVerbal,
        id: agrementId,
        statut: AGREMENT_STATUT.EN_INSTRUCTION,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("procès verbal");
  });

  it("retourne une erreur 400 si une personne morale soumet sans procès verbal lors d'un A_CORRIGER", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({
      organisme: {
        raisonSociale: "ACME Corp",
        siret: "12345678900000",
      },
      typeOrganisme: ORGANISME_TYPE.PERSONNE_MORALE,
      userId: frontUser.id,
    });

    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    const agrementDataWithoutProcVerbal = {
      ...agrementData,
      agrementFiles: (agrementData.agrementFiles ?? []).filter(
        (file) => file.category !== FILE_CATEGORY.PROCVERBAL,
      ),
    };

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementDataWithoutProcVerbal,
        id: agrementId,
        statut: AGREMENT_STATUT.A_CORRIGER,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("procès verbal");
  });
  it("autorise une personne physique sans procès verbal lors de la transmission", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({
      organisme: {
        nomNaissance: "Dupont",
        nomUsage: "Jean Dupont",
        prenom: "Jean",
      },
      typeOrganisme: ORGANISME_TYPE.PERSONNE_PHYSIQUE,
      userId: frontUser.id,
    });

    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });

    const agrementDataWithoutProcVerbal = {
      ...agrementData,
      agrementFiles: (agrementData.agrementFiles ?? []).filter(
        (file) => file.category !== FILE_CATEGORY.PROCVERBAL,
      ),
    };

    const agrementId = await createAgrement({
      agrement: agrementDataWithoutProcVerbal,
      organismeId,
    });

    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send({
        ...agrementDataWithoutProcVerbal,
        id: agrementId,
        statut: AGREMENT_STATUT.TRANSMIS,
      });

    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });
});

describe("PATCH /agrements/:agrementId/statut", () => {
  it("retourne 404 si l'agrement est introuvable (if !agrement)", async () => {
    const frontUser = await createUsagersUser();
    const response = await request(getFoAppHelper(frontUser))
      .patch(`/agrements/999999/statut`)
      .send({ statut: AGREMENT_STATUT.TRANSMIS });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "Aucun organismeId récupéré pour l'agrement",
    );
  });

  it("Devrait remonter une erreur sur la récupération de la fiche territoire", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({
      organisme: {
        personnePhysique: {
          nom: "Dupont",
          prenom: "Jean",
        },
        typeOrganisme: ORGANISME_TYPE.PERSONNE_PHYSIQUE,
      },
      userId: frontUser.id,
    });
    const agrementData = await buildAgrementFixture({
      organismeId,
      regionObtention: "PACA",
      statut: AGREMENT_STATUT.BROUILLON,
    });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const newAgrementData = {
      ...agrementData,
      id: agrementId,
      statut: AGREMENT_STATUT.TRANSMIS,
    };
    await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(newAgrementData);

    // Vérifie que le mail envoyé à la région contient le nom et prénom de la personne physique
    const calls = (mailService.send as jest.Mock).mock.calls;
    const mailToRegion = calls.find((call) => {
      const to = call[0].to || call[0].email;
      return to && to.endsWith("@territoire.com");
    });
    expect(mailToRegion).toBeUndefined();
  });

  it("workflow changement statut de l'agrement", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    await createTerritoire({
      territoire: { service_mail: "region-idf@example.com" },
      territoireCode: "IDF",
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper(frontUser))
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.TRANSMIS });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.TRANSMIS);

    expect(mailService.send).toHaveBeenCalledTimes(0);
  });

  it("devrait changer le statut d'un agrément avec succès pour le retour de complétude", async () => {
    const usagerUser = await createUsagersUser();
    // Ici on répond aux conditions de mise à jour backOffice
    const adminUser = await createAdminUser();
    await createTerritoire({ territoireCode: "IDF" });
    const organismeId = await createOrganisme({ userId: usagerUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper({ id: usagerUser.id }))
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.TRANSMIS });
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      statut: AGREMENT_STATUT.EN_INSTRUCTION,
      territoireCode: agrementData.regionObtention!,
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.EN_INSTRUCTION,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.usager_user).toBeDefined();
    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.EN_INSTRUCTION);
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      commentaire: "commentaire à corriger",
      statut: AGREMENT_STATUT.A_CORRIGER,
      territoireCode: agrementData.regionObtention!,
    });
    const responseCorrection = await request(
      getFoAppHelper({ id: usagerUser.id }),
    )
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.EN_INSTRUCTION });
    expect(responseCorrection.status).toBe(200);
    expect(responseCorrection.body.success).toBe(true);
  });
  it("devrait changer le statut en agrement VALIDE", async () => {
    const usagerUser = await createUsagersUser();
    // Ici on répond aux conditions de mise à jour backOffice
    const adminUser = await createAdminUser();
    await createTerritoire({ territoireCode: "IDF" });
    const organismeId = await createOrganisme({ userId: usagerUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper({ id: usagerUser.id }))
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.TRANSMIS });
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      statut: AGREMENT_STATUT.EN_INSTRUCTION,
      territoireCode: agrementData.regionObtention!,
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const responseCorrection = await request(
      getFoAppHelper({ id: usagerUser.id }),
    )
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.VALIDE });
    expect(responseCorrection.status).toBe(200);
    expect(responseCorrection.body.success).toBe(true);

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.VALIDE,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.usager_user).toBeDefined();
    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.VALIDE);
  });

  it("devrait changer le statut en agrement REFUSE", async () => {
    const usagerUser = await createUsagersUser();
    // Ici on répond aux conditions de mise à jour backOffice
    const adminUser = await createAdminUser();
    await createTerritoire({ territoireCode: "IDF" });
    const organismeId = await createOrganisme({ userId: usagerUser.id });
    const agrementData = await buildAgrementFixture({
      organismeId,
      statut: AGREMENT_STATUT.BROUILLON,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
    const response = await request(getFoAppHelper({ id: usagerUser.id }))
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.TRANSMIS });
    await AgrementServiceAdmin.updateStatut({
      agrementId,
      boUserId: String(adminUser.id),
      statut: AGREMENT_STATUT.EN_INSTRUCTION,
      territoireCode: agrementData.regionObtention!,
    });
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const responseCorrection = await request(
      getFoAppHelper({ id: usagerUser.id }),
    )
      .patch(`/agrements/${agrementId}/statut`)
      .send({ statut: AGREMENT_STATUT.REFUSE });
    expect(responseCorrection.status).toBe(200);
    expect(responseCorrection.body.success).toBe(true);

    // Vérifier que l'événement a bien été historisé
    const history = await AgrementService.getHistory(agrementId);
    const aModifierEvent = history.find(
      (event) =>
        event.type === AGREMENT_HISTORY_TYPE.STATUT_CHANGE ||
        event.type_precision === AGREMENT_STATUT.VALIDE,
    );

    expect(aModifierEvent).toBeDefined();
    expect(aModifierEvent?.usager_user).toBeDefined();
    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.statut).toBe(AGREMENT_STATUT.REFUSE);
  });
});

describe("upload fichiers", () => {
  it("supprime le fichier single-upload orphelin lors de la mise à jour", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });
    const initialFileUuid = crypto.randomUUID();
    const agrementData = await buildAgrementFixture({
      agrementFiles: [
        {
          agrementId: null,
          category: FILE_CATEGORY.ASSURRAPAT,
          fileUuid: initialFileUuid,
        },
      ],
      organismeId,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    const updateData = {
      ...agrementData,
      agrementFiles: [],
      id: agrementId,
    };
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(updateData);
    expect(response.status).toBe(200);

    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.agrementFiles).toEqual([]);
  });

  it("supprime les fichiers multi-upload orphelins lors de la mise à jour", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });

    const fileUuid1 = crypto.randomUUID();
    const fileUuid2 = crypto.randomUUID();
    const fileUuid3 = crypto.randomUUID();
    const agrementData = await buildAgrementFixture({
      agrementFiles: [
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid1,
        },
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid2,
        },
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid3,
        },
      ],
      organismeId,
    });
    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    // Mise à jour : on ne garde que fileUuid2
    const updateData = {
      ...agrementData,
      agrementFiles: [
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid2,
        },
      ],
      id: agrementId,
    };
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(updateData);
    expect(response.status).toBe(200);

    const { agrement } = await getAgrement(agrementId);
    expect(agrement?.agrementFiles).toEqual([
      expect.objectContaining({
        category: FILE_CATEGORY.CHANGEEVOL,
        fileUuid: fileUuid2,
      }),
    ]);
  });
  it("supprime les fichiers orphelins lors de la mise à jour d'un agrément", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });

    const fileUuid1 = crypto.randomUUID();
    const fileUuid2 = crypto.randomUUID();
    const agrementData = await buildAgrementFixture({
      agrementFiles: [
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid1,
        },
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid2,
        },
      ],
      organismeId,
    });

    // Spy sur la fonction deleteFile
    const deleteFileSpy = jest.spyOn(DocumentService, "deleteFile");

    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    // Mise à jour : on ne garde que fileUuid2
    const updateData = {
      ...agrementData,
      agrementFiles: [
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid2,
        },
      ],
      id: agrementId,
    };
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(updateData);
    expect(response.status).toBe(200);

    // Vérifie que deleteFile a été appelée pour fileUuid1
    expect(deleteFileSpy).toHaveBeenCalledWith(fileUuid1, expect.anything());

    // Nettoyage
    deleteFileSpy.mockRestore();
  });

  it("log une erreur Sentry si la suppression d'un fichier orphelin échoue lors de la mise à jour", async () => {
    const frontUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: frontUser.id });

    const fileUuid1 = crypto.randomUUID();
    const fileUuid2 = crypto.randomUUID();
    const agrementData = await buildAgrementFixture({
      agrementFiles: [
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid1,
        },
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid2,
        },
      ],
      organismeId,
    });

    // Mock deleteFile pour throw une erreur
    const deleteFileSpy = jest
      .spyOn(DocumentService, "deleteFile")
      .mockImplementationOnce(() => {
        throw new Error("Suppression échouée");
      })
      .mockImplementationOnce(() => Promise.resolve());

    // Mock Sentry
    const sentryCaptureSpy = jest
      .spyOn(Sentry, "captureException")
      .mockImplementation(() => "mocked-sentry-id");
    const sentryBreadcrumbSpy = jest
      .spyOn(Sentry, "addBreadcrumb")
      .mockImplementation(() => {});

    const agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });

    const updateData = {
      ...agrementData,
      agrementFiles: [
        {
          agrementId: null,
          category: FILE_CATEGORY.CHANGEEVOL,
          fileUuid: fileUuid2,
        },
      ],
      id: agrementId,
    };
    const response = await request(getFoAppHelper(frontUser))
      .post(`/agrements/`)
      .send(updateData);
    expect(response.status).toBe(200);

    // Vérifie que Sentry.captureException a été appelé
    expect(sentryCaptureSpy).toHaveBeenCalledTimes(1);
    expect(sentryBreadcrumbSpy).toHaveBeenCalledTimes(1);

    // Nettoyage
    deleteFileSpy.mockRestore();
    sentryCaptureSpy.mockRestore();
    sentryBreadcrumbSpy.mockRestore();
  });
});

describe("Messagerie d'agrément", () => {
  let agrementId: number;
  let messageAuthUser: { id: number };

  beforeEach(async () => {
    messageAuthUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: messageAuthUser.id });
    const agrementData = await buildAgrementFixture({ organismeId });
    agrementId = await createAgrement({
      agrement: agrementData,
      organismeId,
    });
  });

  it("POST /message devrait créer un message et retourner 201", async () => {
    const postResponse = await request(getFoAppHelper(messageAuthUser))
      .post(`/agrements/${agrementId}/message`)
      .send({ message: "Message de test" });
    expect(postResponse.status).toBe(201);
    expect(postResponse.body.success).toBe(true);
  });

  it("GET /messages devrait retourner les messages existants", async () => {
    await request(getFoAppHelper(messageAuthUser))
      .post(`/agrements/${agrementId}/message`)
      .send({ message: "Message de test" });

    const getResponse = await request(getFoAppHelper(messageAuthUser)).get(
      `/agrements/${agrementId}/messages`,
    );
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.messages).toBeDefined();
    expect(getResponse.body.count).toBe(1);
    expect(getResponse.body.messages[0].message).toBe("Message de test");
    expect(getResponse.body.messages[0].backUserPrenom).toBeDefined();
  });
  // Agrément inexistant
  it("GET /messages devrait retourner une erreur agrement inexistant", async () => {
    await request(getFoAppHelper(messageAuthUser))
      .post(`/agrements/${agrementId}/message`)
      .send({ message: "Message de test" });

    const getResponse = await request(getFoAppHelper(messageAuthUser)).get(
      `/agrements/999/messages`,
    );
    expect(getResponse.status).toBe(404);
  });

  it("POST /message devrait retourner 404 pour un agrément inexistant", async () => {
    const response = await request(getFoAppHelper(messageAuthUser))
      .post(`/agrements/999999/message`)
      .send({ message: "test" });
    expect(response.status).toBe(404);
  });

  it("GET /messages devrait retourner 404 pour un agrément inexistant", async () => {
    const response = await request(getFoAppHelper(messageAuthUser)).get(
      `/agrements/999999/messages`,
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "Aucun organismeId récupéré pour l'agrement",
    );
  });

  it("PATCH /messages devrait marquer tous les messages non lus comme lus et retourner le bon count", async () => {
    const authUserBo = await createAdminUser({ territoireCode: "IDF" });
    await createAgrementMessage({
      agrementId,
      agrementMessage: { back_user_id: authUserBo.id as number },
      userType: USER_TYPE.BO,
    });
    await createAgrementMessage({
      agrementId,
      agrementMessage: { back_user_id: authUserBo.id as number },
      userType: USER_TYPE.BO,
    });
    await request(getFoAppHelper(messageAuthUser)).get(
      `/agrements/${agrementId}/messages`,
    );

    const patchResponse = await request(getFoAppHelper(messageAuthUser)).patch(
      `/agrements/${agrementId}/messages/read`,
    );
    expect(patchResponse.status).toBe(200);
    expect(patchResponse.body.count).toBe(2);

    const getResponse = await request(getFoAppHelper(messageAuthUser)).get(
      `/agrements/${agrementId}/messages`,
    );
    expect(getResponse.body.unreadCount).toBe(0);
  });

  it("PATCH /messages devrait remonter une erreur", async () => {
    const patchResponse = await request(getFoAppHelper(messageAuthUser)).patch(
      `/agrements/999/messages/read`,
    );
    expect(patchResponse.status).toBe(404);
  });

  it("POST /message couvre if !agrement avec 404 explicite", async () => {
    const response = await request(getFoAppHelper(messageAuthUser))
      .post(`/agrements/123456/message`)
      .send({ message: "Message test" });

    expect(response.status).toBe(404);
  });

  it("PATCH /messages/read couvre if !agrement avec 404 explicite", async () => {
    const response = await request(getFoAppHelper(messageAuthUser)).patch(
      `/agrements/123456/messages/read`,
    );

    expect(response.status).toBe(404);
    expect(response.body.message).toBe(
      "Aucun organismeId récupéré pour l'agrement",
    );
  });
});
