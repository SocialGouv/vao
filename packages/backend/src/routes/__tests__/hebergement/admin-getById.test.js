const request = require("supertest");
const app = require("../../../app"); // Chemin vers ton application Express
const Hebergement = require("../../../services/hebergement/Hebergement");
const boCheckJWT = require("../../../middlewares/bo-check-JWT");
const checkPermissionHebergement = require("../../../middlewares/checkPermissionHebergement");

// Mock des services et middlewares
jest.mock("../../../services/hebergement/Hebergement");
jest.mock("../../../middlewares/bo-check-JWT");
jest.mock("../../../middlewares/checkPermissionHebergement");
jest.mock(
  "../../../middlewares/checkStatutHebergement",
  () => () => (req, res, next) => {
    next();
  },
);
describe("GET /hebergement/admin/:id", () => {
  const user = {
    id: 1,
    role: "admin",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock des middlewares
    boCheckJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionHebergement.mockImplementation((req, res, next) => {
      next();
    });
  });

  it("devrait retourner un hébergement par ID avec succès", async () => {
    const mockHebergement = {
      id: "123",
    };

    // Mock de Hebergement.getById
    Hebergement.getById.mockResolvedValue(mockHebergement);

    const response = await request(app).get("/hebergement/admin/123");

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(Hebergement.getById).toHaveBeenCalledWith("123");
  });

  it("devrait retourner une erreur 400 si l'ID est manquant ou invalide", async () => {
    boCheckJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    Hebergement.getById.mockResolvedValueOnce(null);
    const response = await request(app).get("/hebergement/admin/2");
    expect(response.status).toBe(400);
  });
});
