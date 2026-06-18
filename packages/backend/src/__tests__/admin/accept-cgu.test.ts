import request from "supertest";

import {
  createBoUserSessionCookies,
  getBoAppHelper,
} from "../helpers/appHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createAdminUserValide } from "../helpers/userHelper";

const userFixtureComplement = { cgu_accepted: false, ter_code: "IDF" };

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /bo-user/accept-cgu/", () => {
  it("devrait retourner un user", async () => {
    const adminUser = await createAdminUserValide(userFixtureComplement);
    const cookies = await createBoUserSessionCookies(adminUser);

    const response = await request(getBoAppHelper())
      .post("/bo-user/accept-cgu/")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user).toHaveProperty("cguAccepted", true);
  });

  it("devrait retourner 409 sans session", async () => {
    const response = await request(getBoAppHelper()).post(
      "/bo-user/accept-cgu/",
    );

    expect(response.status).toBe(409);
    expect(response.body.name).toBe("TokenRevoked");
  });
});
