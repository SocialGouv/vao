import request from "supertest";

import {
  createFoUserSessionCookies,
  getFoAppHelper,
} from "../helpers/appHelper";
import {
  createTestContainer,
  removeTestContainer,
} from "../helpers/testContainer";
import { createUsagersUserValide } from "../helpers/userHelper";

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /fo-user/accept-cgu/", () => {
  it("devrait retourner 200 avec un user", async () => {
    const user = await createUsagersUserValide({ cgu_accepted: false });
    const cookies = await createFoUserSessionCookies(user);

    const response = await request(getFoAppHelper())
      .post("/fo-user/accept-cgu/")
      .set("Cookie", cookies);

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("cguAccepted", true);
  });

  it("devrait retourner 409 sans session", async () => {
    const response = await request(getFoAppHelper()).post(
      "/fo-user/accept-cgu/",
    );

    expect(response.status).toBe(409);
    expect(response.body.name).toBe("TokenRevoked");
  });
});
