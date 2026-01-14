import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";

import config from "../../../config";
import acceptCgu from "../../../controllers/bo-user/accept-cgu";
import Session from "../../../services/common/Session";
import CommonUser from "../../../services/common/Users";

// ===== MOCKS =====
jest.mock("../../../services/common/Users");
jest.mock("../../../services/common/Session");
jest.mock("jsonwebtoken");

// jwt.sign mock
const mockJwtSign = jest.spyOn(jwt, "sign");

// ===== APP EXPRESS DE TEST =====
function createApp(decodedUser) {
  const app = express();
  app.use(express.json());

  app.post("/accept-cgu", (req, res, next) => {
    req.decoded = decodedUser;
    acceptCgu(req, res, next);
  });

  // middleware d’erreur (sans next inutilisé)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    res.status(err.statusCode || 500).json({ message: err.message });
  });

  return app;
}

describe("POST /accept-cgu", () => {
  const user = {
    cguAccepted: false,
    email: "test@test.fr",
    id: 1,
    role: "admin",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockJwtSign.mockReturnValue("fake-jwt-token");

    config.tokenSecret_BO = "secret";
    config.algorithm = "HS256";
    config.accessToken.expiresIn = 60000;
    config.refreshToken.expiresIn = 120000;
  });

  // =========================
  // ✅ SUCCÈS
  // =========================
  it("accepte les CGU et retourne l'utilisateur avec cookies", async () => {
    CommonUser.acceptCgu.mockResolvedValue(undefined);
    Session.create.mockResolvedValue(undefined);

    const app = createApp({ ...user });

    const response = await request(app).post("/accept-cgu").expect(200);

    expect(CommonUser.acceptCgu).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
      }),
    );

    expect(Session.create).toHaveBeenCalledWith(
      user.id,
      "fake-jwt-token",
      expect.any(String),
    );

    expect(response.body.user.cguAccepted).toBe(true);

    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("VAO_BO_access_token"),
        expect.stringContaining("VAO_BO_refresh_token"),
      ]),
    );
  });

  // =========================
  // ❌ USER ABSENT → 403
  // =========================
  it("retourne une erreur 403 si user absent", async () => {
    const app = createApp(undefined);

    const response = await request(app).post("/accept-cgu").expect(403);

    expect(response.body.message).toBe("Paramètre incorrect");
    expect(CommonUser.acceptCgu).not.toHaveBeenCalled();
  });

  // =========================
  // 💥 ERREUR acceptCgu
  // =========================
  it("propage une erreur si acceptCgu échoue", async () => {
    CommonUser.acceptCgu.mockRejectedValue(new Error("DB error"));

    const app = createApp({ ...user });

    const response = await request(app).post("/accept-cgu").expect(500);

    expect(response.body.message).toBe("DB error");
  });
});
