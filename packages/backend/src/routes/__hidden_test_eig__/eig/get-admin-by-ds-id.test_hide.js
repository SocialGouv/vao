const boCheckJWT = require("../../../middlewares/bo-check-JWT");
const checkPermissionBODeclarationSejour = require("../../../middlewares/checkPermissionBODeclarationSejour");
const getDepartements = require("../../../middlewares/getDepartements");
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");

jest.mock("../../../middlewares/bo-check-JWT");

jest.mock("../../../middlewares/checkPermissionBODeclarationSejour");
jest.mock("../../../middlewares/getDepartements");
jest.mock("../../../services/eig");

describe("GET /eig/admin/ds/:declarationId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.resetAllMocks();
    boCheckJWT.mockImplementation((req, res, next) => {
      req.decoded = {
        ...user,
        roles: ["eig", "DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
      };
      next();
    });

    getDepartements.mockImplementation((req, res, next) => {
      next();
    });
    checkPermissionBODeclarationSejour.mockImplementation((req, res, next) => {
      next();
    });
  });

  it("shoud return a 403 if the admin don't have role eig", async () => {
    boCheckJWT.mockImplementationOnce((req, res, next) => {
      req.decoded = {
        ...user,
        roles: ["DemandeSejour_Lecture", "DemandeSejour_Ecriture"],
      };
      next();
    });
    const response = await request(app).get("/eig/admin/ds/1");
    expect(response.statusCode).toBe(403);
    expect(eigService.getByDsIdAdmin).not.toHaveBeenCalled();
  });

  it("should call getByDsIdAdmin if everything is ok", async () => {
    const response = await request(app).get("/eig/admin/ds/1");
    expect(response.statusCode).toBe(200);
    expect(eigService.getByDsIdAdmin).toHaveBeenCalled();
  });
});
