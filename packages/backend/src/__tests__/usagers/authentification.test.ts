import request from "supertest";

import app from "../../app";
import { getEtablissement } from "../../services/Insee";
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

jest.mock("../../services/Insee", () => ({
  getEtablissement: jest.fn(),
}));

beforeAll(async () => {
  await createTestContainer();
});

afterAll(async () => {
  await removeTestContainer();
});

describe("POST /authentication/email/register", () => {
  it("should return 400 if SIRET is not found", async () => {
    authUser = await createUsagersUser();

    getEtablissement.mockResolvedValue(null);

    const payload = {
      email: "test@example.com",
      nom: "Doe",
      password: "HelloHello1!!",
      prenom: "John",
      siret: "00000000000000",
      telephone: "0102030405",
    };

    const response = await request(app)
      .post("/authentication/email/register")
      .send(payload);

    console.log("Response body:", response.body);
    expect(response.status).toBe(400);
    expect(response.body.name).toBe("SiretNotFound");
  });
});
