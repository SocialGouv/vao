import request from "supertest";

import app from "../../app";
import { createHebergement } from "../helper/fixtures/hebergementHelper";
import { createOrganisme } from "../helper/fixtures/organismeHelper";
import { createUsagersUser } from "../helper/fixtures/userHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helper/testContainer";

let authUser = { id: 1, role: "admin" };

jest.mock("../../middlewares/common/checkJWT", () => {
  return async (req, res, next) => {
    req.decoded = authUser;
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
    const organismeId = await createOrganisme();
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
});
