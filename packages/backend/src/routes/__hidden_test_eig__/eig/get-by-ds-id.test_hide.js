const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionDeclarationSejour = require("../../../middlewares/checkPermissionDeclarationSejour");
const AppError = require("../../../utils/error").default;
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionDeclarationSejour");
jest.mock("../../../services/eig");

describe("GET /eig/ds/:declarationId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.resetAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionDeclarationSejour.mockImplementation((req, res, next) => {
      next();
    });
  });

  it("should return an error 403 if you don't have dclaration sejour permission for eig", async () => {
    checkPermissionDeclarationSejour.mockImplementation((req, res, next) => {
      return next(
        new AppError(
          "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
          {
            statusCode: 403,
          },
        ),
      );
    });

    const response = await request(app).get("/eig/ds/1");
    expect(response.statusCode).toBe(403);
    expect(eigService.getByDsId).not.toHaveBeenCalled();
  });

  it("should call getByDsId if everything is ok", async () => {
    const response = await request(app).get("/eig/ds/1");
    expect(response.statusCode).toBe(200);
    expect(eigService.getByDsId).toHaveBeenCalled();
  });
});
