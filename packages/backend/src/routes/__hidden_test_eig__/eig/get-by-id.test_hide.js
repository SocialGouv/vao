const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionEIG = require("../../../middlewares/checkPermissionEIG");
const AppError = require("../../../utils/error").default;
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");
const { getEmails } = require("../../../helpers/eigMail");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionEIG");
jest.mock("../../../services/eig");
jest.mock("../../../helpers/eigMail");

describe("GET /eig/id", () => {
  const user = {
    id: 1,
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionEIG.mockImplementation((req, res, next) => {
      next();
    });
    eigService.getById.mockResolvedValue({
      declarationId: 1,
    });
    getEmails.mockResolvedValue({});
  });

  it("should return an error 403 if you don't have dclaration sejour permission for eig", async () => {
    checkPermissionEIG.mockImplementation((req, res, next) => {
      return next(
        new AppError(
          "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
          {
            statusCode: 403,
          },
        ),
      );
    });

    const response = await request(app).get("/eig/1");
    expect(response.statusCode).toBe(403);
    expect(eigService.getById).not.toHaveBeenCalled();
  });

  it("should call getByDsId if everything is ok", async () => {
    const response = await request(app).get("/eig/1");
    expect(response.statusCode).toBe(200);
    expect(eigService.getById).toHaveBeenCalled();
  });
});
