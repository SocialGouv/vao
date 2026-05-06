import { AGREMENT_STATUT } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import boCheckJWT from "../../middlewares/bo-check-JWT";
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
  createAdminUserValide,
  createUsagersUserValide,
} from "../helpers/userHelper";

jest.mock("../../middlewares/bo-check-JWT", () => jest.fn());
jest.mock("../../services/mail", () => ({
  mailService: { send: jest.fn() },
}));
jest.mock("../../services/pdf/eig/generate", () =>
  jest.fn().mockResolvedValue(Buffer.from("pdf")),
);

const boCheckJWTMock = boCheckJWT as unknown as jest.Mock;

let foUserId = 0;
let boUserId = 0;
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
  const boUser = await createAdminUserValide({ ter_code: "FRA" });

  foUserId = foUser.id;
  boUserId = boUser.id;

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
  boCheckJWTMock.mockImplementation(
    (req: UserRequest, _res: Response, next: NextFunction) => {
      req.decoded = {
        id: boUserId,
        roles: ["eig", "DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
        territoireCode: "FRA",
      } as unknown as User;
      next();
    },
  );
});

describe("Domaine /eig (admin)", () => {
  it("GET /eig/admin/ds/:declarationId retourne les eig", async () => {
    const eigId = await createEig();
    await eigService.depose(eigId);

    const response = await request(app).get(`/eig/admin/ds/${declarationId}`);
    expect(response.status).toBe(200);
    expect(response.body.eigs).toBeInstanceOf(Array);
  });

  it("GET /eig/admin retourne la liste admin", async () => {
    const eigId = await createEig();
    await eigService.depose(eigId);

    const response = await request(app).get("/eig/admin").query({
      search: "{}",
    });
    expect(response.status).toBe(200);
    expect(response.body.eig?.eigs).toBeInstanceOf(Array);
  });

  it("GET /eig/admin/pdf/:id retourne un pdf", async () => {
    const eigId = await createEig();
    await eigService.depose(eigId);

    const response = await request(app).get(`/eig/admin/pdf/${eigId}`);
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("application/pdf");
  });

  it("GET /eig/admin/pdf/:id retourne 500 si eig inconnu", async () => {
    const response = await request(app).get("/eig/admin/pdf/999999999");
    expect(response.status).toBe(400);
  });

  it("GET /eig/admin/total-to-read retourne le total", async () => {
    const response = await request(app).get("/eig/admin/total-to-read");
    expect(response.status).toBe(200);
    expect(response.body.totalToRead).toBeDefined();
  });

  it("GET /eig/admin/:id retourne un eig", async () => {
    const eigId = await createEig();
    await eigService.depose(eigId);

    const response = await request(app).get(`/eig/admin/${eigId}`);
    expect(response.status).toBe(200);
    expect(response.body.eig.id).toBe(eigId);
  });

  it("POST /eig/admin/:id/mark-as-read marque comme lu", async () => {
    boCheckJWTMock.mockImplementationOnce(
      (req: UserRequest, _res: Response, next: NextFunction) => {
        req.decoded = {
          id: boUserId,
          roles: ["eig", "DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
          territoireCode: "75",
        } as unknown as User;
        next();
      },
    );

    const eigId = await createEig();
    await eigService.depose(eigId);

    const response = await request(app).post(
      `/eig/admin/${eigId}/mark-as-read`,
    );
    expect(response.status).toBe(200);
    expect(response.body.markAsRead).toBe(true);
  });

  it("POST /eig/admin/:id/mark-as-read retourne 400 en statut brouillon", async () => {
    const eigId = await createEig();
    const response = await request(app).post(
      `/eig/admin/${eigId}/mark-as-read`,
    );
    expect(response.status).toBe(400);
    expect(response.body.name).toBe("AppError");
  });
});
