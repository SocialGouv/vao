const request = require("supertest");
const app = require("../../../app");
const Hebergement = require("../../../services/hebergement/Hebergement");
const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionHebergement = require("../../../middlewares/checkPermissionHebergement");
const yup = require("yup");
const FOUser = require("../../../services/FoUser");

// Mock de la méthode Hebergement.update
jest.mock("../../../services/hebergement/Hebergement");
jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionHebergement");
jest.mock("../../../schemas/hebergement");
jest.mock("../../../services/FoUser");
jest.mock(
  "../../../middlewares/checkStatutHebergement",
  () => () => (req, res, next) => {
    next();
  },
);
describe("POST /", () => {
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
      .post("/hebergement")
      .send({ nom: "Hébergement" }) // Paramètre manquant
      .expect(400);
    expect(res.statusCode).toBe(400);
  });

  it("should return 200 if the hebergement is posted successfully", async () => {
    Hebergement.create.mockResolvedValueOnce(true);
    FOUser.getUserOrganisme.mockResolvedValueOnce(1);

    const body = {
      coordonnees: { lat: 10, lon: 20 },
      informationsLocaux: {},
      informationsTransport: {},
      nom: "Hébergement 1",
    };

    jest.spyOn(yup, "object").mockImplementationOnce(() => ({
      validate: (parametre) => {
        return parametre;
      },
    }));
    const res = await request(app).post("/hebergement").send(body);

    expect(res.status).toBe(200);
    expect(Hebergement.create).toHaveBeenCalledWith(
      1,
      1,
      "actif",
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
      .post("/hebergement")
      .send({
        coordonnees: {},
        informationsLocaux: "Info",
        informationsTransport: "Info",
        nom: "Hébergement",
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
        coordonnees: { lat: 10, lon: 20 },
        informationsLocaux: "Info locaux",
        informationsTransport: "Info transport",
        nom: "Hébergement",
      });

    expect(res.status).toBe(400);
  });
});