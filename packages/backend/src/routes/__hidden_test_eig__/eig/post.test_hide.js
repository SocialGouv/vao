const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionDeclarationSejourForEig = require("../../../middlewares/checkPermissionDeclarationSejourEig");
const DemandeSejour = require("../../../services/DemandeSejour");
const request = require("supertest");
const app = require("../../../app");
const { isDeclarationligibleToEig } = require("../../../helpers/eig");
const yup = require("yup");
const eigService = require("../../../services/eig");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionDeclarationSejourEig");
jest.mock("../../../services/DemandeSejour");
jest.mock("../../../helpers/eig");
jest.mock("../../../services/eig");

describe("POST /eig", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  const user = {
    id: 1,
  };
  beforeEach(() => {
    jest.clearAllMocks();
    checkJWT.mockImplementation((req, res, next) => {
      req.decoded = { ...user };
      next();
    });
    checkPermissionDeclarationSejourForEig.mockImplementation(
      (req, res, next) => {
        next();
      },
    );
  });

  it("should return an error 404 if declaration is missing", async () => {
    DemandeSejour.getOne.mockResolvedValue(null);

    const response = await request(app)
      .post("/eig")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(404);
  });

  it("should return an error 400 if declaration is not eligible", async () => {
    DemandeSejour.getOne.mockResolvedValue({ id: 1 });
    isDeclarationligibleToEig.mockReturnValue(false);
    const response = await request(app)
      .post("/eig")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(400);
  });

  it("should return a validation error if the body is not validate by yup", async () => {
    DemandeSejour.getOne.mockResolvedValue({
      dateDebut: new Date("2024-01-01"),
      dateFin: new Date("2024-01-10"),
      id: 1,
    });
    isDeclarationligibleToEig.mockReturnValue(true);
    jest.spyOn(yup, "object").mockImplementation(() => ({
      validate: () => {
        throw new Error();
      },
    }));
    const response = await request(app)
      .post("/eig")
      .send({ parametre: { declarationId: 1 } });

    expect(yup.object).toHaveBeenCalled();
    expect(response.statusCode).toBe(400);
  });

  it("should call eig create service if everything is ok", async () => {
    DemandeSejour.getOne.mockResolvedValue({
      dateDebut: new Date("2024-01-01"),
      dateFin: new Date("2024-01-10"),
      id: 1,
    });
    isDeclarationligibleToEig.mockReturnValue(true);
    jest.spyOn(yup, "object").mockImplementation(() => ({
      validate: (parametre) => {
        return parametre;
      },
    }));
    eigService.create.mockResolvedValueOnce(1);

    const response = await request(app)
      .post("/eig")
      .send({ parametre: { declarationId: 1 } });

    expect(eigService.create).toHaveBeenCalled();
    expect(response.statusCode).toBe(200);
  });
});
