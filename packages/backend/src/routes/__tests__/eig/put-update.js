const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionEIG = require("../../../middlewares/checkPermissionEIG");
const checkPermissionDeclarationSejourForEig = require("../../../middlewares/checkPermissionDeclarationSejourEig");
const canUpdateEig = require("../../../middlewares/can-update-or-delete-eig");
const DemandeSejour = require("../../../services/DemandeSejour");
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");
const AppError = require("../../../utils/error");
const {
  isDeclarationligibleToEig,
  UpdateTypes,
} = require("../../../helpers/eig");
const yup = require("yup");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionEIG");
jest.mock("../../../middlewares/checkPermissionDeclarationSejourEig");
jest.mock("../../../middlewares/can-update-or-delete-eig");
jest.mock("../../../services/DemandeSejour");
jest.mock("../../../services/eig");
jest.mock("../../../helpers/eig");

describe("PUT /eig", () => {
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
    checkPermissionDeclarationSejourForEig.mockImplementation(
      (req, res, next) => {
        next();
      },
    );
    canUpdateEig.mockImplementation((req, res, next) => {
      next();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return an error 404 if declaration is missing", async () => {
    DemandeSejour.getOne.mockResolvedValue(null);

    const response = await request(app)
      .put("/eig/1")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(404);
    expect(eigService.updateDS).not.toHaveBeenCalled();
    expect(eigService.updateType).not.toHaveBeenCalled();
    expect(eigService.updateRenseignementsGeneraux).not.toHaveBeenCalled();
    expect(eigService.updateEmailAutresDestinataires).not.toHaveBeenCalled();
  });

  it("should return an error 403 if you don't have permission for eig", async () => {
    checkPermissionEIG.mockImplementation((req, res, next) => {
      return next(
        new AppError("Vous n'êtes pas autorisé à accéder à cet EIG", {
          statusCode: 403,
        }),
      );
    });

    const response = await request(app)
      .put("/eig/1")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(403);
    expect(eigService.updateDS).not.toHaveBeenCalled();
    expect(eigService.updateType).not.toHaveBeenCalled();
    expect(eigService.updateRenseignementsGeneraux).not.toHaveBeenCalled();
    expect(eigService.updateEmailAutresDestinataires).not.toHaveBeenCalled();
  });

  it("should return an error 403 if you don't have dclaration sejour permission for eig", async () => {
    checkPermissionDeclarationSejourForEig.mockImplementation(
      (req, res, next) => {
        return next(
          new AppError(
            "Vous n'êtes pas autorisé à accéder à cette déclaration de séjour",
            {
              statusCode: 403,
            },
          ),
        );
      },
    );
    DemandeSejour.getOne.mockResolvedValue({ id: 1 });
    isDeclarationligibleToEig.mockReturnValue(false);

    const response = await request(app)
      .put("/eig/1")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(403);
    expect(eigService.updateDS).not.toHaveBeenCalled();
    expect(eigService.updateType).not.toHaveBeenCalled();
    expect(eigService.updateRenseignementsGeneraux).not.toHaveBeenCalled();
    expect(eigService.updateEmailAutresDestinataires).not.toHaveBeenCalled();
  });

  it("should return an error 400 if declaration is not eligible", async () => {
    DemandeSejour.getOne.mockResolvedValue({ id: 1 });
    isDeclarationligibleToEig.mockReturnValue(false);
    const response = await request(app)
      .put("/eig/1")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(400);
    expect(eigService.updateDS).not.toHaveBeenCalled();
    expect(eigService.updateType).not.toHaveBeenCalled();
    expect(eigService.updateRenseignementsGeneraux).not.toHaveBeenCalled();
    expect(eigService.updateEmailAutresDestinataires).not.toHaveBeenCalled();
  });

  it("should call eig update service if everything is ok", async () => {
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

    const responseDS = await request(app)
      .put("/eig/1")
      .send({
        parametre: { declarationId: 1 },
        type: UpdateTypes.DECLARATION_SEJOUR,
      });
    expect(eigService.updateDS).toHaveBeenCalled();
    expect(responseDS.statusCode).toBe(200);

    const responseType = await request(app)
      .put("/eig/1")
      .send({
        parametre: { declarationId: 1 },
        type: UpdateTypes.TYPE_EVENEMENT,
      });
    expect(eigService.updateType).toHaveBeenCalled();
    expect(responseType.statusCode).toBe(200);

    const responseRG = await request(app)
      .put("/eig/1")
      .send({
        parametre: { declarationId: 1 },
        type: UpdateTypes.RENSEIGNEMENT_GENERAUX,
      });
    expect(eigService.updateRenseignementsGeneraux).toHaveBeenCalled();
    expect(responseRG.statusCode).toBe(200);

    const responseMail = await request(app)
      .put("/eig/1")
      .send({
        parametre: { declarationId: 1 },
        type: UpdateTypes.EMAIL_AUTRES_DESTINATAIRES,
      });
    expect(eigService.updateEmailAutresDestinataires).toHaveBeenCalled();
    expect(responseMail.statusCode).toBe(200);
  });
});
