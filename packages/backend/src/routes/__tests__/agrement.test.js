const request = require("supertest");
const app = require("../../app");
const AgrementService = require("../../services/Agrement");
const checkPermissionAgrement = require("../../middlewares/checkPermissionAgrement");
const checkJWT = require("../../middlewares/checkJWT");

jest.mock("../../middlewares/checkJWT");
jest.mock("../../middlewares/checkPermissionAgrement");
jest.mock("../../services/Agrement");

describe("POST /agrements", () => {
  beforeEach(() => {
    AgrementService.getByOrganismeId.mockClear();
    AgrementService.update.mockClear();
    AgrementService.create.mockClear();
  });

  it("should create a new agrement if none exists", async () => {
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

    checkPermissionAgrement.mockImplementation((req, res, next) => {
      next();
    });

    AgrementService.getByOrganismeId.mockResolvedValue(null);
    AgrementService.create.mockResolvedValue(123);

    const response = await request(app).post("/agrements").send({
      dateObtention: "2024-01-01",
      file: "fichier.pdf",
      numero: "AG123",
      organismeId: "1",
      regionObtention: "Île-de-France",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 123);
    expect(AgrementService.create).toHaveBeenCalledWith(
      "1",
      "AG123",
      "Île-de-France",
      "2024-01-01",
      expect.any(String),
      "fichier.pdf",
    );
  });

  it("should update the existing agrement if it already exists", async () => {
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

    checkPermissionAgrement.mockImplementation((req, res, next) => {
      next();
    });

    AgrementService.getByOrganismeId.mockResolvedValue({ id: 123 });
    AgrementService.update.mockResolvedValue(123);

    const response = await request(app).post("/agrements").send({
      dateObtention: "2024-01-01",
      file: "fichier.pdf",
      numero: "AG123",
      organismeId: "123",
      regionObtention: "Île-de-France",
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", 123);
    expect(AgrementService.update).toHaveBeenCalledWith(
      "123",
      "AG123",
      "Île-de-France",
      "2024-01-01",
      expect.any(String),
      "fichier.pdf",
    );
  });
});
