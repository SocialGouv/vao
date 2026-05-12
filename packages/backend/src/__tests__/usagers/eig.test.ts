import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import { roles } from "../../helpers/users";
import checkJWT from "../../middlewares/checkJWT";
import eigService from "../../services/eig";
import { User, UserRequest } from "../../types/request";
import { createAgrement } from "../helpers/agrementsHelper";
import { createDemandeSejour } from "../helpers/demandeSejourHelper";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUserValide } from "../helpers/userHelper";

jest.mock("../../middlewares/checkJWT", () => jest.fn());
jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));

const checkJWTMock = checkJWT as unknown as jest.Mock;

let foUserId = 0;
let declarationId = 0;

const createEig = async (): Promise<number> => {
  return eigService.create({
    date: new Date().toISOString().slice(0, 10),
    declarationId,
    departement: "75",
    userId: foUserId,
  });
};

beforeAll(async () => {
  await createTestContainer();
  const foUser = await createUsagersUserValide({
    roles: [roles.EIG_LECTURE, roles.EIG_ECRITURE],
  });

  foUserId = foUser.id;

  const organismeId = await createOrganisme({ userId: foUserId });
  await createAgrement({
    agrement: {
      regionObtention: "IDF",
      statut: AGREMENT_STATUT.VALIDE,
    },
    organismeId,
  });
  declarationId = await createDemandeSejour({
    organismeId,
    statut: "SEJOUR EN COURS",
  });
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

describe("Domaine /eig", () => {
  describe("GET /eig/me", () => {
    it("retourne 200 avec des EIG", async () => {
      await createEig();

      const response = await request(app).get("/eig/me").query({
        limit: 10,
        offset: 0,
        search: "{}",
        sortBy: "id",
        sortDirection: "ASC",
      });

      expect(response.status).toBe(200);
      expect(response.body.eig?.eigs).toBeInstanceOf(Array);
      expect(response.body.eig?.eigs?.length).toBeGreaterThan(0);
    });

    it("retourne 400 quand la query est invalide", async () => {
      const response = await request(app).get("/eig/me").query({
        sortDirection: "INVALID",
      });

      expect(response.status).toBe(400);
      expect(response.body.name).toBe("ValidationError");
    });
  });

  describe("GET /eig/ds/:declarationId", () => {
    it("retourne 200 avec la liste des EIG pour la déclaration", async () => {
      await createEig();

      const response = await request(app).get(`/eig/ds/${declarationId}`);
      expect(response.status).toBe(200);
      expect(response.body.eigs).toBeInstanceOf(Array);
    });
  });

  describe("GET /eig/available-ds", () => {
    it("retourne 200 avec un tableau vide sans paramètre search", async () => {
      const response = await request(app).get("/eig/available-ds");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("retourne 200 avec des déclarations quand search est fourni", async () => {
      await createEig();

      const response = await request(app).get("/eig/available-ds").query({
        search: "TSTMSG",
      });
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe("GET /eig/:id", () => {
    it("retourne 200 avec le détail EIG enrichi", async () => {
      const eigId = await createEig();
      const response = await request(app).get(`/eig/${eigId}`);
      expect(response.status).toBe(200);
      expect(response.body.eig.id).toBe(eigId);
    });
  });

  describe("POST /eig", () => {
    it("retourne 400 quand declarationId est absent du payload", async () => {
      const response = await request(app).post("/eig").send({
        parametre: {},
      });
      expect(response.status).toBe(400);
    });

    it("retourne 200 et crée un EIG", async () => {
      const response = await request(app)
        .post("/eig")
        .send({
          parametre: {
            date: new Date().toISOString().slice(0, 10),
            declarationId,
            departement: "75",
          },
        });
      expect(response.status).toBe(200);
      expect(response.body.id).toBeDefined();
    });
  });

  describe("PUT /eig/:id", () => {
    it("retourne 400 quand le payload est invalide", async () => {
      const eigId = await createEig();
      const response = await request(app)
        .put(`/eig/${eigId}`)
        .send({
          parametre: { date: "2020-01-01" },
          type: "DECLARATION_SEJOUR",
        });
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("ValidationError");
    });
  });

  describe("POST /eig/depose/:id", () => {
    it("retourne 400 quand l'EIG est incomplet", async () => {
      const eigId = await createEig();
      const response = await request(app).post(`/eig/depose/${eigId}`).send({});
      expect(response.status).toBe(400);
      expect(response.body.name).toBe("ValidationError");
    });
  });

  describe("DELETE /eig/:id", () => {
    it("retourne 200 et supprime l'EIG", async () => {
      const eigId = await createEig();
      const response = await request(app).delete(`/eig/${eigId}`);
      expect(response.status).toBe(200);
      expect(response.body.eig).toBe(String(eigId));
    });
  });
});
