import request from "supertest";

import { getFoAppHelper } from "../helpers/appHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUser } from "../helpers/userHelper";

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("GET /users/me", () => {
  it("devrait retourner le user courant avec ses feature flags", async () => {
    const frontUser = await createUsagersUser();

    const response = await request(getFoAppHelper(frontUser)).get("/users/me");

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.email).toBe(frontUser.email);
    expect(response.body.user.featureFlags).toBeDefined();
    expect(typeof response.body.user.featureFlags).toBe("object");
  });

  it("should return a 404 error if the user is not found", async () => {
    const response = await request(
      getFoAppHelper({ email: "invalid@example.com", id: 0 }),
    ).get("/users/me");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("name", "UserNotFound");
  });
});

describe("PATCH /users/me", () => {
  it("met a jour le profil et retourne 200", async () => {
    const frontUser = await createUsagersUser();

    const response = await request(getFoAppHelper(frontUser))
      .patch("/users/me")
      .send({
        nom: "Updated",
        prenom: "User",
      });

    expect(response.status).toBe(200);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.id).toBe(frontUser.id);
  });

  it("retourne 400 si les donnees sont invalides", async () => {
    const frontUser = await createUsagersUser();

    const response = await request(getFoAppHelper(frontUser))
      .patch("/users/me")
      .send({
        nom: "",
        prenom: "",
      });

    expect(response.status).toBe(400);
    expect(response.body.name).toBe("ValidationError");
  });
});
