const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionEIG = require("../../../middlewares/checkPermissionEIG");
const canUpdateEig = require("../../../middlewares/can-update-or-delete-eig");
const AppError = require("../../../utils/error").default;
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionEIG");
jest.mock("../../../middlewares/can-update-or-delete-eig");
jest.mock("../../../services/eig");
jest.mock("../../../services/DemandeSejour");
jest.mock("../../../helpers/eigMail");
jest.mock("../../../utils/mail");
jest.mock("../../../services/geo/Commune");
jest.mock("../../../services/mail");

describe("DELETE /eig/:id", () => {
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionEIG.mockImplementation((req, res, next) => {
      next();
    });
    canUpdateEig.mockImplementation((req, res, next) => {
      next();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an error 403 if you don't have permission for eig", async () => {
    checkPermissionEIG.mockImplementation((req, res, next) => {
      return next(
        new AppError("Vous n'êtes pas autorisé à accéder à cet EIG", {
          statusCode: 403,
        }),
      );
    });

    const response = await request(app).delete("/eig/1");
    expect(response.statusCode).toBe(403);
    expect(eigService.delete).not.toHaveBeenCalled();
  });

  it("should depose an eig if everything is ok", async () => {
    const response = await request(app).delete("/eig/1");
    expect(response.statusCode).toBe(200);
    expect(eigService.delete).toHaveBeenCalled();
  });
});
