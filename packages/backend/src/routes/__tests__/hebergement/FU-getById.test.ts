import { HebergementDto } from "@vao/shared-bridge";
import request from "supertest";

import app from "../../../app"; // Chemin vers ton application Express
import CheckJWT from "../../../middlewares/checkJWT";
import checkPermissionHebergement from "../../../middlewares/checkPermissionHebergement";
import Hebergement from "../../../services/hebergement/Hebergement";

// Mock des services et middlewares
jest.mock("../../../services/hebergement/Hebergement");
jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionHebergement");
jest.mock(
  "../../../middlewares/checkStatutHebergement",
  () => () => (req, res, next) => {
    next();
  },
);
describe("GET /hebergement/:id", () => {
  const user = {
    id: 1,
    role: "admin",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock des middlewares
    (CheckJWT as jest.MockedFunction<typeof CheckJWT>).mockImplementation(
      async (req, res, next) => {
        req.decoded = { ...user };
        next();
      },
    );
    (
      checkPermissionHebergement as jest.MockedFunction<
        typeof checkPermissionHebergement
      >
    ).mockImplementation(async (req, res, next) => {
      next();
    });
  });

  it("devrait retourner un hébergement par ID avec succès", async () => {
    const mockHebergement = {
      id: 123,
    } as HebergementDto;
    // Mock de Hebergement.getById
    (Hebergement.getById as jest.MockedFunction<typeof Hebergement.getById>)
      // @ts-expect-error TODO: fix HebergementDto type
      .mockResolvedValue(mockHebergement);

    const response = await request(app).get("/hebergement/123");

    // Vérification des résultats
    expect(response.status).toBe(200);
    expect(Hebergement.getById).toHaveBeenCalledWith("123");
  });

  it("devrait retourner une erreur 400 si l'ID est manquant ou invalide", async () => {
    (CheckJWT as jest.MockedFunction<typeof CheckJWT>).mockImplementationOnce(
      async (req, res, next) => {
        req.decoded = { ...user };
        req.params = {};
        next();
      },
    );
    (
      Hebergement.getById as jest.MockedFunction<typeof Hebergement.getById>
    ).mockResolvedValue(null);
    const response = await request(app).get("/hebergement/2");
    expect(response.status).toBe(400);
  });
});
