import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { randomInt } from "crypto";
import request from "supertest";

import { partOrganisme } from "../../helpers/org-part";
import { mailService } from "../../services/mail";
import { update as updateOrganismeService } from "../../services/Organisme";
import { getPool } from "../../utils/pgpool";
import { createAgrement } from "../helpers/agrementsHelper";
import { getFoAppHelper } from "../helpers/appHelper";
import {
  createOrganisme,
  generateRandomSiret,
  getRandomSiretAndSiren,
} from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

let authUserId = 1;
let organismeId = 1;
let organismeFixtureSiret = "";

async function setupOrganismeFinalizePrerequisites({
  organismeId,
  userId,
}: {
  organismeId: number;
  userId: number;
}): Promise<void> {
  await updateOrganismeService(
    partOrganisme.PROTOCOLE_TRANSPORT,
    {
      deplacementDurantSejour: false,
      files: [],
      responsableTransportLieuSejour: ["vacanciers"],
      vehiculesAdaptes: false,
    },
    organismeId,
    userId,
  );

  await updateOrganismeService(
    partOrganisme.PROTOCOLE_SANITAIRE,
    {
      accordCabinetMedical: false,
      conservationMedicamentThermosensible: false,
      constitutionEquipe: [],
      dispositionsSpecifiques: false,
      ficheSuiviMedicaments: false,
      files: [],
      gestionBudgetPersonnel: "organisateur",
      individualisationMedicaments: false,
      preparationPilluliers: "aucune",
      prescriptionMedicaleJointe: false,
      protocoleAccident: false,
      protocoleCanicule: false,
      protocoleEvacuation: false,
      protocoleModificationTraitement: false,
      protocoleReorientation: false,
      responsableAdministrationMedicament: [],
      stockageMedicamentSecurise: false,
      troussePharmacie: false,
    },
    organismeId,
    userId,
  );
}

beforeAll(async () => {
  await createTestContainer();
  organismeFixtureSiret = generateRandomSiret();
  const user = await createUsagersUser();
  authUserId = user.id;
  organismeId = await createOrganisme({
    organisme: {
      nomNaissance: "Test Nom",
      nomUsage: "Test Usage",
      prenom: "Test Prenom",
      profession: "Construction",
      siret: organismeFixtureSiret,
    },
    userId: authUserId,
  });
  await createAgrement({
    agrement: {
      dateObtention: new Date("2025-01-01"),
      file: { uuid: "fixture-agrement-file" },
      statut: AGREMENT_STATUT.VALIDE,
    },
    organismeId,
  });
  await setupOrganismeFinalizePrerequisites({
    organismeId,
    userId: authUserId,
  });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  (mailService.send as jest.Mock).mockResolvedValue(undefined);
});

describe("GET /organisme", () => {
  it("retourne 200 et l'organisme lié à l'utilisateur", async () => {
    const response = await request(getFoAppHelper({ id: authUserId })).get(
      "/organisme",
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(organismeId);
  });

  it("retourne 200 et organisme null si aucun organisme n'est lié", async () => {
    const orphanUser = await createUsagersUser();
    const response = await request(getFoAppHelper({ id: orphanUser.id })).get(
      "/organisme",
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme).toBeNull();
  });
});

describe("GET /organisme/:organismeId", () => {
  it("retourne 200 et l'organisme lorsque l'utilisateur est autorisé", async () => {
    const response = await request(getFoAppHelper({ id: authUserId })).get(
      `/organisme/${organismeId}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(organismeId);
  });

  it("retourne 403 si l'utilisateur n'est pas lié à l'organisme", async () => {
    const otherUser = await createUsagersUser();
    const response = await request(getFoAppHelper(otherUser)).get(
      `/organisme/${organismeId}`,
    );

    expect(response.status).toBe(403);
  });

  it("retourne 400 si organismeId n'est pas un entier", async () => {
    const response = await request(getFoAppHelper({ id: authUserId })).get(
      "/organisme/invalide",
    );

    expect(response.status).toBe(400);
  });
});

describe("GET /organisme/siret/:siret", () => {
  it("retourne 200 et l'organisme pour un SIRET présent en base", async () => {
    const response = await request(getFoAppHelper({ id: authUserId })).get(
      `/organisme/siret/${organismeFixtureSiret}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(organismeId);
  });

  it("retourne 200 et organisme null pour un SIRET inconnu", async () => {
    const response = await request(getFoAppHelper({ id: authUserId })).get(
      "/organisme/siret/00000000000000",
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme).toBeNull();
  });
});

describe("POST /organisme", () => {
  it("retourne 200 et crée un organisme personne physique et lie l'utilisateur", async () => {
    const postUser = await createUsagersUser();
    const siret = generateRandomSiret();
    const stamp = Date.now();
    const response = await request(getFoAppHelper({ id: postUser.id }))
      .post("/organisme")
      .send({
        parametre: {
          adresseDomicile: {
            cleInsee: "12345",
            codeInsee: "12345",
            codePostal: "75001",
            departement: "75",
            label: "123 Rue Test",
            lat: 48.8566,
            long: 2.3522,
          },
          adresseIdentique: true,
          adresseSiege: {
            cleInsee: "12345",
            codeInsee: "12345",
            codePostal: "75001",
            departement: "75",
            label: "123 Rue Test",
            lat: 48.8566,
            long: 2.3522,
          },
          nomNaissance: `PostNaissance${stamp}`,
          nomUsage: `PostUsage${stamp}`,
          prenom: `PostPrenom${stamp}`,
          profession: "Testeur",
          siret,
          telephone: "0102030405",
        },
        type: partOrganisme.PERSONNE_PHYSIQUE,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("sauvegarde organisme OK");
    expect(typeof response.body.organismeId).toBe("number");
  });

  it("retourne 400 si type ou parametre est absent", async () => {
    const response = await request(getFoAppHelper({ id: authUserId }))
      .post("/organisme")
      .send({});

    expect(response.status).toBe(400);
  });
});

describe("POST /organisme/:organismeId", () => {
  it("retourne 200 lors de la mise a jour d'un organisme personne morale", async () => {
    const personneMoraleUser = await createUsagersUser();
    const organismePersonneMoraleId = await createOrganisme({
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: personneMoraleUser.id,
    });
    const response = await request(
      getFoAppHelper({ id: personneMoraleUser.id }),
    )
      .post(`/organisme/${organismePersonneMoraleId}`)
      .send({
        parametre: { siret: generateRandomSiret() },
        type: partOrganisme.PERSONNE_MORALE,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("sauvegarde organisme OK");
  });

  it("retourne 200 lors de la mise a jour des etablissements secondaires", async () => {
    const personneMoraleUser = await createUsagersUser();
    const organismePersonneMoraleId = await createOrganisme({
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: personneMoraleUser.id,
    });
    const response = await request(
      getFoAppHelper({ id: personneMoraleUser.id }),
    )
      .post(`/organisme/${organismePersonneMoraleId}`)
      .send({
        parametre: {
          etablissements: [
            {
              adresse: "1 rue du test",
              codePostal: "75001",
              commune: "Paris",
              denomination: "Etablissement secondaire test",
              enabled: true,
              etatAdministratif: "A",
              nic: "00001",
              siret: generateRandomSiret(),
            },
          ],
        },
        type: partOrganisme.ETABLISSEMENTS_SECONDAIRES,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("sauvegarde organisme OK");
  });

  it("retourne 403 si l'utilisateur ne peut pas modifier l'organisme", async () => {
    const otherUser = await createUsagersUser();
    const response = await request(getFoAppHelper(otherUser))
      .post(`/organisme/${organismeId}`)
      .send({
        parametre: { siret: "38456094200045" },
        type: "personne_morale",
      });

    expect(response.status).toBe(403);
  });

  it("retourne 200 et remplace la personne physique lorsque le SIRET change (historique suppression + création)", async () => {
    const postUser = await createUsagersUser();
    const siretInitial = generateRandomSiret();
    const siretNouveau = generateRandomSiret();
    const orgPourChangementSiret = await createOrganisme({
      organisme: {
        nomNaissance: "SiretChangeNaissance",
        nomUsage: "SiretChangeUsage",
        prenom: "SiretChangePrenom",
        profession: "Construction",
        siret: siretInitial,
      },
      userId: postUser.id,
    });
    await createAgrement({
      agrement: {
        dateObtention: new Date("2025-01-01"),
        file: { uuid: "fixture-agrement-siret-change" },
        regionObtention: "IDF",
        statut: AGREMENT_STATUT.VALIDE,
      },
      organismeId: orgPourChangementSiret,
    });
    const stamp = Date.now();
    const response = await request(getFoAppHelper({ id: postUser.id }))
      .post(`/organisme/${orgPourChangementSiret}`)
      .send({
        parametre: {
          adresseDomicile: {
            cleInsee: "12345",
            codeInsee: "12345",
            codePostal: "75001",
            departement: "75",
            label: "10 rue Siret",
            lat: 48.8566,
            long: 2.3522,
          },
          adresseIdentique: true,
          adresseSiege: {
            cleInsee: "12345",
            codeInsee: "12345",
            codePostal: "75001",
            departement: "75",
            label: "10 rue Siret",
            lat: 48.8566,
            long: 2.3522,
          },
          nomNaissance: `SiretChangeNaissance${stamp}`,
          nomUsage: `SiretChangeUsage${stamp}`,
          prenom: "SiretChangePrenom",
          profession: "Construction",
          siret: siretNouveau,
          telephone: "0102030405",
        },
        type: partOrganisme.PERSONNE_PHYSIQUE,
      });

    expect(response.status).toBe(200);
    expect(mailService.send).toHaveBeenCalledTimes(1);
    const mailPayload = (mailService.send as jest.Mock).mock.calls[0][0];
    expect(mailPayload.subject).toContain("Changement de SIRET");
  });

  it("retourne 200 et notifie le siège lors du changement de SIRET d'un établissement secondaire", async () => {
    const { siren, siret: siretSiege } = getRandomSiretAndSiren();
    const siretSecondaire = `${siren}${String(randomInt(10000, 99999))}`;
    const siretNouveau = `${siren}${String(randomInt(10000, 99999))}`;
    const userSiege = await createUsagersUser();
    const userSecondaire = await createUsagersUser();
    await getPool().query(
      `UPDATE front.users SET status_code = 'VALIDATED' WHERE id = ANY($1::int[])`,
      [[userSiege.id, userSecondaire.id]],
    );

    const orgSiegeId = await createOrganisme({
      organisme: {
        email: `siege-${Date.now()}@example.com`,
        porteurAgrement: true,
        raisonSociale: "Org Siege Test",
        siegeSocial: true,
        siren,
        siret: siretSiege,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: userSiege.id,
    });
    await createAgrement({
      agrement: {
        dateObtention: new Date("2025-01-01"),
        file: { uuid: "fixture-agrement-siege" },
        regionObtention: "IDF",
        statut: AGREMENT_STATUT.VALIDE,
      },
      organismeId: orgSiegeId,
    });

    const orgSecondaireId = await createOrganisme({
      organisme: {
        email: `etab-${Date.now()}@example.com`,
        porteurAgrement: false,
        raisonSociale: "Org Secondaire Test",
        siegeSocial: false,
        siren,
        siret: siretSecondaire,
      },
      typeOrganisme: partOrganisme.PERSONNE_MORALE,
      userId: userSecondaire.id,
    });
    const response = await request(getFoAppHelper({ id: userSecondaire.id }))
      .post(`/organisme/${orgSecondaireId}`)
      .send({
        parametre: {
          adresseDomicile: {
            cleInsee: "12345",
            codeInsee: "12345",
            codePostal: "75001",
            departement: "75",
            label: "10 rue Secondaire",
            lat: 48.8566,
            long: 2.3522,
          },
          adresseIdentique: true,
          adresseSiege: {
            cleInsee: "12345",
            codeInsee: "12345",
            codePostal: "75001",
            departement: "75",
            label: "10 rue Secondaire",
            lat: 48.8566,
            long: 2.3522,
          },
          email: `etab-updated-${Date.now()}@example.com`,
          porteurAgrement: false,
          raisonSociale: "Org Secondaire Test",
          siegeSocial: false,
          siret: siretNouveau,
          telephone: "0102030405",
        },
        type: partOrganisme.PERSONNE_MORALE,
      });

    expect(response.status).toBe(200);
    const secondaryMail = (mailService.send as jest.Mock).mock.calls.find(
      ([payload]: [{ subject: string }]) =>
        payload.subject.includes("établissement secondaire"),
    );
    expect(secondaryMail).toBeDefined();
    expect(secondaryMail?.[0].to).toContain(userSiege.email);
  });
});

describe("POST /organisme/:organismeId/finalize", () => {
  let finalizeOrganismeId = 1;
  let finalizeUserId = 1;

  beforeEach(async () => {
    const finalizeUser = await createUsagersUser();
    finalizeUserId = finalizeUser.id;
    finalizeOrganismeId = await createOrganisme({
      organisme: {
        nomNaissance: "Finalise Nom",
        nomUsage: "Finalise Usage",
        prenom: "Finalise Prenom",
        profession: "Construction",
      },
      userId: finalizeUserId,
    });
    await createAgrement({
      agrement: {
        dateObtention: new Date("2025-01-01"),
        file: { uuid: "fixture-agrement-file" },
        statut: AGREMENT_STATUT.VALIDE,
      },
      organismeId: finalizeOrganismeId,
    });
  });

  it("retourne 400 si l'organisme n'est pas dans le bon état pour la finalisation", async () => {
    const response = await request(getFoAppHelper({ id: finalizeUserId })).post(
      `/organisme/${finalizeOrganismeId}/finalize`,
    );

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("ValidationError");
  });

  it("retourne 200 quand la finalisation est valide", async () => {
    await setupOrganismeFinalizePrerequisites({
      organismeId: finalizeOrganismeId,
      userId: finalizeUserId,
    });

    const response = await request(getFoAppHelper({ id: finalizeUserId })).post(
      `/organisme/${finalizeOrganismeId}/finalize`,
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("sauvegarde organisme OK");
  });

  it("retourne 403 si l'utilisateur ne peut pas finaliser l'organisme", async () => {
    const otherUser = await createUsagersUser();
    const response = await request(getFoAppHelper(otherUser)).post(
      `/organisme/${finalizeOrganismeId}/finalize`,
    );

    expect(response.status).toBe(403);
  });
});
