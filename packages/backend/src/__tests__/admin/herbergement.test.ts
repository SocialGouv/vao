import { UserDto } from "@vao/shared-bridge";
import { NextFunction, Response } from "express";
import request from "supertest";

import app from "../../app";
import { UserRequest } from "../../types/request";
import { createHebergement } from "../helpers/hebergementHelper";
import { createOrganisme } from "../helpers/organismeHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

let authUser = { id: 1, role: "admin" };

jest.mock("../../middlewares/common/checkJWT", () => {
  return async (req: UserRequest, res: Response, next: NextFunction) => {
    req.decoded = authUser as unknown as UserDto;
    next();
  };
});

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /hebergement/admin/:id", () => {
  it("devrait retourner un hébergement par ID avec succès", async () => {
    authUser = await createUsagersUser();
    const organismeId = await createOrganisme({ userId: authUser.id });
    const hebergementId = await createHebergement({
      organismeId,
      userId: authUser.id,
    });

    const response = await request(app).get(
      `/hebergement/admin/${hebergementId}`,
    );

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(response.body.hebergement.id).toEqual(hebergementId);
  });

  it("retourne 404 si l'hebergement n'existe pas", async () => {
    authUser = await createUsagersUser();
    const response = await request(app).get("/hebergement/admin/999999");

    expect(response.status).toBe(404);
  });
});

describe("GET /hebergement/admin", () => {
  it("retourne 200 pour la liste admin", async () => {
    authUser = await createUsagersUser({ territoireCode: "IDF" });
    const response = await request(app).get("/hebergement/admin/");

    expect(response.status).toBe(200);
  });
});

describe("GET /hebergement/extract", () => {
  it("retourne 200 et un CSV pour l'extract admin", async () => {
    authUser = await createUsagersUser({ territoireCode: "IDF" });
    const response = await request(app).get("/hebergement/extract/");

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
  });
});
