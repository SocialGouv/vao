const request = require("supertest");
const app = require("../../../app");
const Hebergement = require("../../../services/hebergement/Hebergement");
const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionHebergementSiegeSocial = require("../../../middlewares/checkPermissionHebergementSiegeSocial");

// Mock de la méthode Hebergement.update
jest.mock("../../../services/hebergement/Hebergement");
jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionHebergementSiegeSocial");
jest.mock(
  "../../../middlewares/checkStatutHebergement",
  () => () => (req, res, next) => {
    next();
  },
);
jest.mock("../../../schemas/hebergement");

describe("PUT /:id/reactivate", () => {
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionHebergementSiegeSocial.mockImplementation(
      (req, res, next) => {
        next();
      },
    );
  });

  it("should return 404", async () => {
    const res = await request(app).put("/hebergement/1/reactivate").expect(404);
    expect(res.statusCode).toBe(404);
  });

  it("should return 200", async () => {
    Hebergement.getStatut.mockResolvedValue({ id: 1 });
    const res = await request(app).put("/hebergement/1/reactivate").expect(200);
    expect(res.statusCode).toBe(200);
    expect(Hebergement.getStatut).toHaveBeenCalled();
    expect(Hebergement.updateStatut).toHaveBeenCalled();
  });
});
