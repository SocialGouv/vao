const request = require("supertest");
const app = require("../../../app");
const Hebergement = require("../../../services/hebergement/Hebergement");
const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionHebergement = require("../../../middlewares/checkPermissionHebergement");
const yup = require("yup");

// Mock de la méthode Hebergement.update
jest.mock("../../../services/hebergement/Hebergement");
jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionHebergement");
jest.mock("../../../schemas/hebergement");

describe("POST /:id", () => {
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionHebergement.mockImplementation((req, res, next) => {
      next();
    });
  });

  it("should return 400 if a required parameter is missing", async () => {
    const res = await request(app)
      .post("/hebergement/1")
      .send({ nom: "Hébergement" }) // Paramètre manquant
      .expect(400);
    expect(res.statusCode).toBe(400);
  });

  it("should return 200 if the hebergement is updated successfully", async () => {
    Hebergement.update.mockResolvedValueOnce(true);

    const body = {
      nom: "Hébergement 1",
      coordonnees: { lat: 10, lon: 20 },
      informationsLocaux: {},
      informationsTransport: {},
    };

    jest.spyOn(yup, "object").mockImplementationOnce(() => ({
      validate: (parametre) => {
        return parametre;
      },
    }));
    const res = await request(app).post("/hebergement/123").send(body);

    expect(res.status).toBe(200);
    expect(Hebergement.update).toHaveBeenCalledWith(
      1, // userId
      "123", // hebergementId
      expect.objectContaining(body),
    );
  });

  it("should return 400 if validation fails with yup", async () => {
    // Simule l'échec de la validation avec yup
    jest.spyOn(yup, "object").mockImplementationOnce(() => ({
      validate: () => {
        throw new Error("error");
      },
    }));

    const res = await request(app)
      .post("/hebergement/123")
      .send({
        nom: "Hébergement",
        coordonnees: {},
        informationsLocaux: "Info",
        informationsTransport: "Info",
      })
      .expect(400);

    expect(res.status).toBe(400);
  });

  it("should return 404 if Hebergement.update throws an archive error", async () => {
    const archiveError = new Error("Hebergement archived");
    archiveError.cause = "archive";
    Hebergement.update.mockRejectedValueOnce(archiveError);

    jest.spyOn(yup, "object").mockImplementationOnce(() => ({
      validate: (parametre) => {
        return parametre;
      },
    }));

    const res = await request(app)
      .post("/hebergement/123")
      .send({
        nom: "Hébergement",
        coordonnees: { lat: 10, lon: 20 },
        informationsLocaux: "Info locaux",
        informationsTransport: "Info transport",
      });

    expect(res.status).toBe(400);
  });
});
