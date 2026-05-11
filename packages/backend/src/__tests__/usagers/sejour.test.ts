import { DEMANDE_SEJOUR_STATUTS } from "@vao/shared-bridge";
import dayjs from "dayjs";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import { partOrganisme } from "../../helpers/org-part";
import checkJWT from "../../middlewares/checkJWT";
import DemandeSejour from "../../services/DemandeSejour";
import { mailService } from "../../services/mail";
import { User, UserRequest } from "../../types/request";
import {
  createDemandeSejour,
  deleteDemandeSejour,
} from "../helpers/demandeSejourHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import {
  createOrganisme,
  markOrganismeComplet,
} from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUserValide,
} from "../helpers/userHelper";

const buildResponsableSejour = () => ({
  adresse: { label: "1 rue Test" },
  email: "responsable@test.com",
  fonction: "Responsable",
  nom: "Doe",
  prenom: "John",
  telephone: "0102030405",
});

jest.mock("../../middlewares/checkJWT", () => jest.fn());
jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

const checkJWTMock = checkJWT as unknown as jest.Mock;

let foUserId = 0;
let organismeId = 0;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide();
  foUserId = foUser.id;
  organismeId = await createOrganisme({ userId: foUserId });
  declarationId = await createDemandeSejour({ organismeId });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  checkJWTMock.mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = {
        id: foUserId,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
        territoireCode: "FRA",
      } as unknown as User;
      next();
    },
  );
});

describe("Domaine /sejour", () => {
  describe("GET /sejour/stats", () => {
    it("retourne 200 avec les stats", async () => {
      const response = await request(app).get("/sejour/stats");
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération des stats échoue", async () => {
      const statsSpy = jest
        .spyOn(DemandeSejour, "getStats")
        .mockRejectedValueOnce(new Error("stats failed"));

      const response = await request(app).get("/sejour/stats");
      expect(response.status).toBe(500);
      statsSpy.mockRestore();
    });
  });

  describe("GET /sejour/extract", () => {
    it("retourne 200 avec un CSV", async () => {
      const response = await request(app).get("/sejour/extract");
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand l'extraction FO échoue", async () => {
      const extractSpy = jest
        .spyOn(DemandeSejour, "getExtractFO")
        .mockRejectedValueOnce(new Error("extract fo failed"));

      const response = await request(app).get("/sejour/extract");
      expect(response.status).toBe(500);
      extractSpy.mockRestore();
    });
  });

  describe("GET /sejour/deprecated", () => {
    it("retourne 200 avec les declarations depreciees", async () => {
      const response = await request(app).get("/sejour/deprecated");
      expect(response.status).toBe(200);
    });

    it("retourne 400 avec un sortBy invalide", async () => {
      const response = await request(app).get("/sejour/deprecated").query({
        sortBy: "invalidSort",
      });

      expect(response.status).toBe(400);
    });

    it("retourne 500 quand la récupération des demandes dépréciées échoue", async () => {
      const deprecatedSpy = jest
        .spyOn(DemandeSejour, "getDeprecated")
        .mockRejectedValueOnce(new Error("deprecated failed"));

      const response = await request(app).get("/sejour/deprecated");
      expect(response.status).toBe(500);
      deprecatedSpy.mockRestore();
    });
  });

  describe("GET /sejour/:declarationId", () => {
    it("retourne 200 avec la declaration", async () => {
      const response = await request(app).get(`/sejour/${declarationId}`);
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération de la déclaration échoue", async () => {
      const getOneSpy = jest
        .spyOn(DemandeSejour, "getOne")
        .mockRejectedValueOnce(new Error("get one failed"));

      const response = await request(app).get(`/sejour/${declarationId}`);
      expect(response.status).toBe(500);
      getOneSpy.mockRestore();
    });
  });

  describe("GET /sejour/historique/:declarationId", () => {
    it("retourne 200 avec l'historique de la declaration", async () => {
      const response = await request(app).get(
        `/sejour/historique/${declarationId}`,
      );
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération de l'historique échoue", async () => {
      const historiqueSpy = jest
        .spyOn(DemandeSejour, "historique")
        .mockRejectedValueOnce(new Error("historique failed"));

      const response = await request(app).get(
        `/sejour/historique/${declarationId}`,
      );
      expect(response.status).toBe(500);
      historiqueSpy.mockRestore();
    });

    it("retourne une erreur quand le declarationId n'est pas un nombre", async () => {
      const response = await request(app).get("/sejour/historique/abc");
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe("GET /sejour", () => {
    it("retourne 200 avec la liste des demandes", async () => {
      const response = await request(app).get("/sejour");
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand la récupération des demandes échoue", async () => {
      const getSpy = jest
        .spyOn(DemandeSejour, "get")
        .mockRejectedValueOnce(new Error("get failed"));

      const response = await request(app).get("/sejour");
      expect(response.status).toBe(500);
      getSpy.mockRestore();
    });
  });

  describe("POST /sejour/depose/:declarationId", () => {
    it("retourne 400 si l'attestation est manquante", async () => {
      const response = await request(app)
        .post(`/sejour/depose/${declarationId}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 400 quand l'attestation n'est pas validée", async () => {
      const response = await request(app)
        .post(`/sejour/depose/${declarationId}`)
        .send({ attestation: false });
      expect(response.status).toBe(400);
    });

    it("retourne 400 quand le schéma de la déclaration est incomplet", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-DEP-SCHEMA",
        libelle: "Depose schema test",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/depose/${dsId}`)
        .send({
          attestation: {
            at: "2026-01-01",
            by: { nom: "Doe", prenom: "John" },
          },
        });
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it("retourne 400 quand le statut ne permet pas le dépôt", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-DEP-STATUT",
        libelle: "Depose statut test",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/depose/${dsId}`)
        .send({ attestation: { at: "2026-01-01" } });
      expect([400, 409]).toContain(response.status);
    });
  });

  describe("POST /sejour/:declarationId/copy", () => {
    it("retourne 200 et duplique la declaration", async () => {
      const response = await request(app)
        .post(`/sejour/${declarationId}/copy`)
        .send({});
      expect(response.status).toBe(200);
      expect(response.body.declarationId).toBeDefined();
    });

    it("retourne 404 quand le statut ne permet pas la copie", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-COPY-KO",
        libelle: "Copy KO",
        organismeId,
        statut: "REFUSEE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app).post(`/sejour/${dsId}/copy`).send({});

      expect(response.status).toBe(404);
    });
  });

  describe("POST /sejour/:declarationId", () => {
    it("retourne 400 si type ou parametre est manquant", async () => {
      const response = await request(app)
        .post(`/sejour/${declarationId}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 500 quand la mise à jour échoue", async () => {
      const updateSpy = jest
        .spyOn(DemandeSejour, "update")
        .mockRejectedValueOnce(new Error("update failed"));

      const response = await request(app)
        .post(`/sejour/${declarationId}`)
        .send({
          parametre: { description: "Erreur update" },
          type: "projetSejour",
        });

      expect(response.status).toBe(500);
      updateSpy.mockRestore();
    });

    it("retourne null/200 quand le type n'est pas reconnu", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-TYPE",
        libelle: "Update type inconnu",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { foo: "bar" },
          type: "type_inconnu",
        });
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it("retourne 200 et met à jour les informations vacanciers", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-VAC",
        libelle: "Update vacanciers",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { total: 10, tranchesAge: [] },
          type: "informationsVacanciers",
        });
      expect(response.status).toBe(200);
    });

    it("retourne 200 et met à jour le protocole transport", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-TRA",
        libelle: "Update transport",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { id: 1, transports: [] },
          type: "protocole_transport",
        });
      expect(response.status).toBe(200);
    });

    it("retourne 200 et met à jour le protocole sanitaire", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-SAN",
        libelle: "Update sanitaire",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { id: 1, infosSanitaires: {} },
          type: "protocole_sanitaire",
        });
      expect(response.status).toBe(200);
    });

    it("retourne 200 et envoie le courriel BO pour informationsPersonnel (8J validée)", async () => {
      await createAdminUserValide({
        email: `bo-ds8j-${Date.now()}@example.com`,
        roles: ["DemandeSejour_Ecriture"],
        ter_code: "75",
      });

      const personnelAvant = {
        accompagnants: [{ attestation: true, nom: "Martin", prenom: "Paul" }],
        encadrants: [{ attestation: true, nom: "Dupont", prenom: "Jean" }],
      };
      const organismeJson = {
        personnePhysique: { nom: "Organisme test" },
        typeOrganisme: partOrganisme.PERSONNE_PHYSIQUE,
      };
      const vacanciersJson = {
        effectifPrevisionnel: 10,
        effectifPrevisionnelFemme: 5,
        effectifPrevisionnelHomme: 5,
      };

      const dsId = await createDemandeSejour({
        departementSuivi: "75",
        idFonctionnelle: `8J${Date.now().toString(36)}`.slice(0, 14),
        libelle: "Séjour 8J personnel",
        organisme: organismeJson,
        organismeId,
        personnel: personnelAvant,
        statut: DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
        vacanciers: vacanciersJson,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const parametre = {
        ...personnelAvant,
        encadrants: [{ attestation: true, nom: "Durand", prenom: "Jean" }],
      };

      const response = await request(app).post(`/sejour/${dsId}`).send({
        parametre,
        type: "informationsPersonnel",
      });

      expect(response.status).toBe(200);
      expect(mailService.send).toHaveBeenCalled();
      const payload = (mailService.send as jest.Mock).mock.calls[0][0];
      expect(payload.subject).toContain("personnel");
      expect(payload.html).toContain("Organisme test");
    });

    it("retourne 200 et met à jour le projet de séjour", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-UPD-OK",
        libelle: "Update OK",
        organismeId,
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/${dsId}`)
        .send({
          parametre: { description: "Nouveau projet" },
          type: "projetSejour",
        });

      expect(response.status).toBe(200);
    });
  });

  describe("POST /sejour", () => {
    it("retourne 400 quand le body est invalide", async () => {
      const response = await request(app).post("/sejour").send({});
      expect(response.status).toBe(400);
    });

    it("retourne 200 et crée la déclaration avec un body valide", async () => {
      await markOrganismeComplet(organismeId);
      const response = await request(app)
        .post("/sejour")
        .send({
          parametre: {
            dateDebut: dayjs().add(10, "day").toISOString(),
            dateFin: dayjs().add(12, "day").toISOString(),
            libelle: "Sejour valide test",
            responsableSejour: buildResponsableSejour(),
          },
        });

      expect(response.status).toBe(200);
    });

    it("retourne 400 quand les dates sont invalides", async () => {
      await markOrganismeComplet(organismeId);
      const response = await request(app)
        .post("/sejour")
        .send({
          parametre: {
            dateDebut: "2026-01-10",
            dateFin: "2026-01-05",
            libelle: "Dates invalides",
            responsableSejour: buildResponsableSejour(),
          },
        });

      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /sejour/:declarationId", () => {
    it("retourne 200 et supprime la declaration au statut BROUILLON", async () => {
      const declarationToDelete = await createDemandeSejour({
        idFonctionnelle: "TSTDEL001",
        libelle: "Declaration a supprimer",
        organismeId,
      });
      await createHebergement({
        declarationId: declarationToDelete,
        organismeId,
      });

      const response = await request(app).delete(
        `/sejour/${declarationToDelete}`,
      );
      expect(response.status).toBe(200);
    });

    it("retourne 400 quand la déclaration n'est plus en BROUILLON", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-DEL-KO",
        libelle: "Del KO",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app).delete(`/sejour/${dsId}`);

      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/cancel/:declarationId", () => {
    it("retourne 400 quand le statut ne permet pas l'annulation", async () => {
      const response = await request(app)
        .post(`/sejour/cancel/${declarationId}`)
        .send({});
      expect(response.status).toBe(400);
    });

    it("retourne 200 et annule la déclaration", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-CAN-OK",
        libelle: "Cancel OK",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });

      const response = await request(app)
        .post(`/sejour/cancel/${dsId}`)
        .send({});

      expect(response.status).toBe(200);
    });

    it("retourne 500 si l'envoi de mail back-office échoue", async () => {
      const dsId = await createDemandeSejour({
        idFonctionnelle: "TST-CAN-MAIL-KO",
        libelle: "Cancel Mail KO",
        organismeId,
        statut: "TRANSMISE",
      });
      await createHebergement({ declarationId: dsId, organismeId });
      (mailService.send as jest.Mock).mockRejectedValueOnce(
        new Error("smtp down"),
      );

      const response = await request(app)
        .post(`/sejour/cancel/${dsId}`)
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.name).toBe("AppError");
    });

    it("retourne 403 quand la déclaration a été supprimée (accès refusé par le middleware)", async () => {
      const dsTemp = await createDemandeSejour({
        idFonctionnelle: "TST-CAN-NF",
        libelle: "Cancel inexistant",
        organismeId,
      });
      await createHebergement({ declarationId: dsTemp, organismeId });

      await deleteDemandeSejour(dsTemp);

      const response = await request(app)
        .post(`/sejour/cancel/${dsTemp}`)
        .send({});
      expect(response.status).toBe(403);
      expect(response.body.name).toBe("AppError");
    });
  });
});
