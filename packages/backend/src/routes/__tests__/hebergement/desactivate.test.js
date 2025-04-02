const request = require("supertest");
const app = require("../../../app");
const Hebergement = require("../../../services/hebergement/Hebergement");
const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionHebergementUser = require("../../../middlewares/checkPermissionHebergementUser");

// Mock de la méthode Hebergement.update
jest.mock("../../../services/hebergement/Hebergement");
jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionHebergementUser");
jest.mock(
  "../../../middlewares/checkStatutHebergement",
  () => () => (req, res, next) => {
    next();
  },
);
jest.mock("../../../schemas/hebergement");

describe("PUT /:id/desactivate", () => {
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionHebergementUser.mockImplementation((req, res, next) => {
      next();
    });
  });
  it("should return 404", async () => {
    Hebergement.update.mockResolvedValue();
    const res = await request(app)
      .put("/hebergement/1/desactivate")
      .expect(404);
    expect(res.statusCode).toBe(404);
    expect(Hebergement.getById).toHaveBeenCalledWith("1");
  });

  it("should return 200", async () => {
    Hebergement.getById.mockResolvedValue({ id: 1 });
    Hebergement.update.mockResolvedValue();

    const res = await request(app)
      .put("/hebergement/1/desactivate")
      .expect(200);
    expect(res.statusCode).toBe(200);
    expect(Hebergement.getById).toHaveBeenCalledWith("1");
    expect(Hebergement.update).toHaveBeenCalled();
  });
});
