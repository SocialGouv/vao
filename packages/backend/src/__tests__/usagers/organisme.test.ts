import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import { partOrganisme } from "../../helpers/org-part";
import checkJWT from "../../middlewares/checkJWT";
import { update as updateOrganismeService } from "../../services/Organisme";
import { User, UserRequest } from "../../types/request";
import { createAgrement } from "../helpers/agrementsHelper";
import {
  createOrganisme,
  generateRandomSiret,
} from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

jest.mock("../../middlewares/checkJWT", () => jest.fn());

const checkJWTMock = checkJWT as unknown as jest.Mock;

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
  checkJWTMock.mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = { id: authUserId } as unknown as User;
      next();
    },
  );
});

describe("GET /organisme", () => {
  it("retourne 200 et l'organisme lié à l'utilisateur", async () => {
    const response = await request(app).get("/organisme");

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(organismeId);
  });

  it("retourne 200 et organisme null si aucun organisme n'est lié", async () => {
    const orphanUser = await createUsagersUser();
    checkJWTMock.mockImplementationOnce(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: orphanUser.id } as unknown as User;
        next();
      },
    );

    const response = await request(app).get("/organisme");

    expect(response.status).toBe(200);
    expect(response.body.organisme).toBeNull();
  });
});

describe("GET /organisme/:organismeId", () => {
  it("retourne 200 et l'organisme lorsque l'utilisateur est autorisé", async () => {
    const response = await request(app).get(`/organisme/${organismeId}`);

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(organismeId);
  });

  it("retourne 403 si l'utilisateur n'est pas lié à l'organisme", async () => {
    const otherUser = await createUsagersUser();
    checkJWTMock.mockImplementationOnce(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: otherUser.id } as unknown as User;
        next();
      },
    );

    const response = await request(app).get(`/organisme/${organismeId}`);

    expect(response.status).toBe(403);
  });

  it("retourne 400 si organismeId n'est pas un entier", async () => {
    const response = await request(app).get("/organisme/invalide");

    expect(response.status).toBe(400);
  });
});

describe("GET /organisme/siret/:siret", () => {
  it("retourne 200 et l'organisme pour un SIRET présent en base", async () => {
    const response = await request(app).get(
      `/organisme/siret/${organismeFixtureSiret}`,
    );

    expect(response.status).toBe(200);
    expect(response.body.organisme.organismeId).toBe(organismeId);
  });

  it("retourne 200 et organisme null pour un SIRET inconnu", async () => {
    const response = await request(app).get("/organisme/siret/00000000000000");

    expect(response.status).toBe(200);
    expect(response.body.organisme).toBeNull();
  });
});

describe("POST /organisme", () => {
  it("retourne 200 et crée un organisme personne physique et lie l'utilisateur", async () => {
    const postUser = await createUsagersUser();
    checkJWTMock.mockImplementationOnce(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: postUser.id } as unknown as User;
        next();
      },
    );

    const siret = generateRandomSiret();
    const stamp = Date.now();
    const response = await request(app)
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
    const response = await request(app).post("/organisme").send({});

    expect(response.status).toBe(400);
  });
});

describe("POST /organisme/:organismeId", () => {
  it("retourne 200 quand la mise a jour est valide", async () => {
    const response = await request(app)
      .post(`/organisme/${organismeId}`)
      .send({
        parametre: { siret: "38456094200045" },
        type: "personne_morale",
      });

    expect(response.status).toBe(200);
  });

  it("retourne 403 si l'utilisateur ne peut pas modifier l'organisme", async () => {
    const otherUser = await createUsagersUser();
    checkJWTMock.mockImplementationOnce(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: otherUser.id } as unknown as User;
        next();
      },
    );

    const response = await request(app)
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
    checkJWTMock.mockImplementationOnce(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: postUser.id } as unknown as User;
        next();
      },
    );

    const stamp = Date.now();
    const response = await request(app)
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
    checkJWTMock.mockImplementation(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: finalizeUserId } as unknown as User;
        next();
      },
    );
  });

  it("retourne 400 si l'organisme n'est pas dans le bon état pour la finalisation", async () => {
    const response = await request(app).post(
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

    const response = await request(app).post(
      `/organisme/${finalizeOrganismeId}/finalize`,
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("sauvegarde organisme OK");
  });

  it("retourne 403 si l'utilisateur ne peut pas finaliser l'organisme", async () => {
    const otherUser = await createUsagersUser();
    checkJWTMock.mockImplementationOnce(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = { id: otherUser.id } as unknown as User;
        next();
      },
    );

    const response = await request(app).post(
      `/organisme/${finalizeOrganismeId}/finalize`,
    );

    expect(response.status).toBe(403);
  });
});
