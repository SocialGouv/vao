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
import {
  assignRolesToUsager,
  createUsagersUserValide,
} from "../helpers/userHelper";

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
  const foUser = await createUsagersUserValide();

  foUserId = foUser.id;
  await assignRolesToUsager(foUserId, [roles.EIG_LECTURE, roles.EIG_ECRITURE]);

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
  it("GET /eig/me retourne les eig", async () => {
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

  it("GET /eig/me retourne 400 sur query invalide", async () => {
    const response = await request(app).get("/eig/me").query({
      sortDirection: "INVALID",
    });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("ValidationError");
  });

  it("GET /eig/ds/:declarationId retourne les eig", async () => {
    await createEig();

    const response = await request(app).get(`/eig/ds/${declarationId}`);
    expect(response.status).toBe(200);
    expect(response.body.eigs).toBeInstanceOf(Array);
  });

  it("GET /eig/available-ds retourne [] si search absent", async () => {
    const response = await request(app).get("/eig/available-ds");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("GET /eig/available-ds retourne les declarations disponibles", async () => {
    await createEig();

    const response = await request(app).get("/eig/available-ds").query({
      search: "TSTMSG",
    });
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });

  it("GET /eig/:id retourne un eig enrichi des emails", async () => {
    const eigId = await createEig();
    const response = await request(app).get(`/eig/${eigId}`);
    expect(response.status).toBe(200);
    expect(response.body.eig.id).toBe(eigId);
  });

  it("POST /eig retourne 400 si declarationId manquant", async () => {
    const response = await request(app).post("/eig").send({
      parametre: {},
    });
    expect(response.status).toBe(400);
  });

  it("POST /eig cree un eig", async () => {
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

  it("PUT /eig/:id retourne 400 sur payload invalide", async () => {
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

  it("POST /eig/depose/:id retourne 400 si eig incomplet", async () => {
    const eigId = await createEig();
    const response = await request(app).post(`/eig/depose/${eigId}`).send({});
    expect(response.status).toBe(400);
    expect(response.body.name).toBe("ValidationError");
  });

  it("DELETE /eig/:id supprime un eig", async () => {
    const eigId = await createEig();
    const response = await request(app).delete(`/eig/${eigId}`);
    expect(response.status).toBe(200);
    expect(response.body.eig).toBe(String(eigId));
  });
});
