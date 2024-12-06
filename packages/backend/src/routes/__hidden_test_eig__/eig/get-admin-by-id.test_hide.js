const boCheckJWT = require("../../../middlewares/bo-check-JWT");
const checkPermissionBOEIG = require("../../../middlewares/checkPermissionBOEIG");
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");
const AppError = require("../../../utils/error");
const { getEmails } = require("../../../helpers/eigMail");

jest.mock("../../../middlewares/bo-check-JWT");

jest.mock("../../../middlewares/checkPermissionBODeclarationSejour");
jest.mock("../../../middlewares/getDepartements");
jest.mock("../../../services/eig");
jest.mock("../../../middlewares/checkPermissionBOEIG");
jest.mock("../../../helpers/eigMail");

describe("GET /eig/admin/id", () => {
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
    checkPermissionBOEIG.mockImplementation((req, res, next) => {
      next();
    });
    getEmails.mockResolvedValue({});
    eigService.getById.mockResolvedValue({
      declarationId: 1,
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
    const response = await request(app).get("/eig/admin/1");
    expect(response.statusCode).toBe(403);
    expect(eigService.getById).not.toHaveBeenCalled();
  });

  it("should return an error 403 if you don't have dclaration sejour permission for eig", async () => {
    checkPermissionBOEIG.mockImplementation((req, res, next) => {
      return next(
        new AppError(
          "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
          {
            statusCode: 403,
          },
        ),
      );
    });

    const response = await request(app).get("/eig/admin/1");
    expect(response.statusCode).toBe(403);
    expect(eigService.getById).not.toHaveBeenCalled();
  });

  it("should call getById if everything is ok", async () => {
    const response = await request(app).get("/eig/admin/1");
    expect(response.statusCode).toBe(200);
    expect(eigService.getById).toHaveBeenCalled();
  });
});
