const request = require("supertest");
const app = require("../../app");
const User = require("../../services/User");
const checkJWT = require("../../middlewares/checkJWT");

jest.mock("../../services/User");
jest.mock("../../middlewares/checkJWT");

describe("GET /users/me", () => {
  beforeEach(() => {
    User.read.mockReset();
  });

  it("should return the user information if the token is valid", async () => {
    const user = {
      id: 1,
      mail: "test@example.com",
      nom: "Test",
      prenom: "User",
      telephone: "0102030405",
    };

    checkJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = { ...user };
      next();
    });

    User.read.mockResolvedValue([user]);

    const response = await request(app).get("/users/me");

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("mail", user.mail);
  });

  it("should return a 404 error if the user is not found", async () => {
    const user = {
      id: 1,
      mail: "test@example.com",
      nom: "Test",
      prenom: "User",
      telephone: "0102030405",
    };

    checkJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = { ...user };
      next();
    });

    User.read.mockResolvedValue([]);

    const response = await request(app).get("/users/me");

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty("name", "UserNotFound");
  });

  it("should return a 500 error if the query return an error", async () => {
    const user = {
      id: 1,
      mail: "test@example.com",
      nom: "Test",
      prenom: "User",
      telephone: "0102030405",
    };

    checkJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = { ...user };
      next();
    });

    User.read.mockResolvedValue(null);

    const response = await request(app).get("/users/me");

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("name", "UnexpectedError");
  });
});
