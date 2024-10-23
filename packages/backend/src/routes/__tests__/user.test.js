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

describe("PATCH /users/me", () => {
  beforeEach(() => {
    User.updateUser.mockReset();
  });

  it("should update and return the user if the token and data are valid", async () => {
    const user = {
      id: 1,
      mail: "test@example.com",
      nom: "Updated",
      prenom: "User",
      telephone: "0102030405",
    };

    checkJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = { id: user.id };
      next();
    });

    User.updateUser.mockResolvedValue(user);

    const response = await request(app)
      .patch("/users/me")
      .send({ nom: "Updated", prenom: "User" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("nom", "Updated");
    expect(response.body.user).toHaveProperty("prenom", "User");
  });

  it("should return a validation error if the input data is invalid", async () => {
    const user = {
      id: 1,
      mail: "test@example.com",
      nom: "Test",
      prenom: "User",
    };

    checkJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = { id: user.id };
      next();
    });

    const response = await request(app)
      .patch("/users/me")
      .send({ nom: "", prenom: "" }); // Invalid data

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty("name", "ValidationError");
  });

  it("should return a 500 error if the update query fails", async () => {
    const user = {
      id: 1,
      mail: "test@example.com",
      nom: "Test",
      prenom: "User",
    };

    checkJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = { id: user.id };
      next();
    });

    User.updateUser.mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .patch("/users/me")
      .send({ nom: "Updated", prenom: "User" });

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("name", "UnexpectedError");
  });
});
