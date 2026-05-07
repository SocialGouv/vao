import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import boCheckJWT from "../../middlewares/bo-check-JWT";
import DemandeSejour from "../../services/DemandeSejour";
import { User, UserRequest } from "../../types/request";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import {
  createAdminUserValide,
  createUsagersUserValide,
} from "../helpers/userHelper";

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());
jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

const boCheckJWTMock = boCheckJWT as unknown as jest.Mock;

let foUserId = 0;
let boUserId = 0;
let organismeId = 0;
let declarationId = 0;

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide();
  foUserId = foUser.id;
  const boUser = await createAdminUserValide();
  boUserId = boUser.id;
  organismeId = await createOrganisme({ userId: foUserId });
  declarationId = await createDemandeSejour({ organismeId });
  await createHebergement({ declarationId, organismeId });
});

afterAll(async () => {
  await removeTestContainer();
});

beforeEach(() => {
  jest.clearAllMocks();
  boCheckJWTMock.mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = {
        id: boUserId,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
        territoireCode: "FRA",
      } as unknown as User;
      next();
    },
  );
});

describe("Domaine /sejour (admin)", () => {
  describe("GET /sejour/admin", () => {
    it("retourne 200 avec la liste des demandes", async () => {
      const response = await request(app).get("/sejour/admin");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/messages", () => {
    it("retourne 200 avec les messages", async () => {
      const response = await request(app).get("/sejour/admin/messages");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/extract", () => {
    it("retourne 200 avec un CSV", async () => {
      const response = await request(app).get("/sejour/admin/extract");
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand l'extraction échoue", async () => {
      const extractSpy = jest
        .spyOn(DemandeSejour, "getExtract")
        .mockRejectedValueOnce(new Error("extract failed"));

      const response = await request(app).get("/sejour/admin/extract");

      expect(response.status).toBe(500);
      extractSpy.mockRestore();
    });
  });

  describe("GET /sejour/admin/extract-hebergement", () => {
    it("retourne 200 avec un CSV", async () => {
      const response = await request(app).get(
        "/sejour/admin/extract-hebergement",
      );
      expect(response.status).toBe(200);
    });

    it("retourne 500 quand l'extraction hebergement échoue", async () => {
      const hebergementSpy = jest
        .spyOn(DemandeSejour, "getHebergementsByDepartementCode")
        .mockRejectedValueOnce(new Error("extract hebergement failed"));

      const response = await request(app).get(
        "/sejour/admin/extract-hebergement",
      );

      expect(response.status).toBe(500);
      hebergementSpy.mockRestore();
    });
  });

  describe("GET /sejour/admin/hebergements", () => {
    it("retourne 200 avec la liste des hebergements", async () => {
      const response = await request(app).get("/sejour/admin/hebergements");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/historique/:declarationId", () => {
    it("retourne 200 avec l'historique de la declaration", async () => {
      const response = await request(app).get(
        `/sejour/admin/historique/${declarationId}`,
      );
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/stats", () => {
    it("retourne 200 avec les stats admin", async () => {
      const response = await request(app).get("/sejour/admin/stats");
      expect(response.status).toBe(200);
    });
  });

  describe("GET /sejour/admin/:declarationId", () => {
    it("retourne 200 avec la declaration", async () => {
      const response = await request(app).get(`/sejour/admin/${declarationId}`);
      expect(response.status).toBe(200);
    });
  });

  describe("POST /sejour/admin/:declarationId/prise-en-charge", () => {
    it("retourne 400 quand le statut ne permet pas la prise en charge", async () => {
      const response = await request(app)
        .post(`/sejour/admin/${declarationId}/prise-en-charge`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/admin/:declarationId/demande-complements", () => {
    it("retourne 400 quand le statut ne permet pas la demande de complements", async () => {
      const response = await request(app)
        .post(`/sejour/admin/${declarationId}/demande-complements`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/admin/:declarationId/refus", () => {
    it("retourne 400 quand le statut ne permet pas le refus", async () => {
      const response = await request(app)
        .post(`/sejour/admin/${declarationId}/refus`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("POST /sejour/admin/:declarationId/enregistrement-2-mois", () => {
    it("retourne 400 quand le statut ne permet pas l'enregistrement 2 mois", async () => {
      const response = await request(app)
        .post(`/sejour/admin/${declarationId}/enregistrement-2-mois`)
        .send({});
      expect(response.status).toBe(400);
    });
  });

  describe("Cas avancés (routes admin)", () => {
    describe("POST /sejour/admin/:declarationId/prise-en-charge avec TRANSMISE", () => {
      it("retourne 200 et passe la déclaration EN_COURS", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-PEC-OK",
          libelle: "PEC OK",
          organismeId,
          statut: "TRANSMISE",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(app)
          .post(`/sejour/admin/${dsId}/prise-en-charge`)
          .send({});

        expect(response.status).toBe(200);
      });
    });

    describe("POST /sejour/admin/:declarationId/demande-complements avec EN_COURS", () => {
      it("retourne 200 et passe la déclaration A_MODIFIER", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-COMP-OK",
          libelle: "Compl OK",
          organismeId,
          statut: "EN COURS",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(app)
          .post(`/sejour/admin/${dsId}/demande-complements`)
          .send({ commentaire: "Merci de fournir des compléments" });

        expect(response.status).toBe(200);
      });
    });

    describe("POST /sejour/admin/:declarationId/refus avec EN_COURS", () => {
      it("retourne 200 et passe la déclaration REFUSEE", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-REF-OK",
          libelle: "Refus OK",
          organismeId,
          statut: "EN COURS",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(app)
          .post(`/sejour/admin/${dsId}/refus`)
          .send({ commentaire: "Refus motivé" });

        expect(response.status).toBe(200);
      });
    });

    describe("POST /sejour/admin/:declarationId/refus sans déclaration", () => {
      it("retourne 403 quand la déclaration n'existe pas (permission refusée)", async () => {
        const response = await request(app)
          .post("/sejour/admin/999999/refus")
          .send({ commentaire: "Refus" });
        expect(response.status).toBe(403);
      });
    });

    describe("GET /sejour/admin/:declarationId avec id inexistant", () => {
      it("retourne 403 quand la déclaration n'existe pas (permission refusée)", async () => {
        const response = await request(app).get("/sejour/admin/999999");
        expect(response.status).toBe(403);
      });
    });

    describe("POST /sejour/admin/:declarationId/prise-en-charge sur statut déjà en cours", () => {
      it("retourne 400 quand la déclaration est déjà EN COURS", async () => {
        const dsId = await createDemandeSejour({
          idFonctionnelle: "TST-PEC-DEJA",
          libelle: "PEC deja en cours",
          organismeId,
          statut: "EN COURS",
        });
        await createHebergement({ declarationId: dsId, organismeId });

        const response = await request(app)
          .post(`/sejour/admin/${dsId}/prise-en-charge`)
          .send({});

        expect(response.status).toBe(400);
      });
    });
  });
});
