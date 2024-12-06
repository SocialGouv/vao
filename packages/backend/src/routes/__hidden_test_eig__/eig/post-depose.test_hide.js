const checkJWT = require("../../../middlewares/checkJWT");
const checkPermissionEIG = require("../../../middlewares/checkPermissionEIG");
const canUpdateEig = require("../../../middlewares/can-update-or-delete-eig");
const AppError = require("../../../utils/error");
const request = require("supertest");
const app = require("../../../app");
const eigService = require("../../../services/eig");
const DemandeSejour = require("../../../services/DemandeSejour");
const yup = require("yup");
const { getEmails } = require("../../../helpers/eigMail");
const MailUtils = require("../../../utils/mail");

jest.mock("../../../middlewares/checkJWT");
jest.mock("../../../middlewares/checkPermissionEIG");
jest.mock("../../../middlewares/can-update-or-delete-eig");
jest.mock("../../../services/eig");
jest.mock("../../../services/DemandeSejour");
jest.mock("../../../helpers/eigMail");
jest.mock("../../../utils/mail");
jest.mock("../../../services/geo/Commune");
jest.mock("../../../services/mail");

describe("POST /depose/:id", () => {
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

    const response = await request(app)
      .post("/eig/depose/1")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(403);
    expect(eigService.depose).not.toHaveBeenCalled();
  });

  it("should depose an eig if everything is ok", async () => {
    DemandeSejour.getOne.mockResolvedValue({
      dateDebut: new Date("2024-01-01"),
      dateFin: new Date("2024-01-10"),
      hebergement: { hebergements: [] },
      id: 1,
      responsableSejour: { email: "a@a.com" },
    });
    eigService.getById.mockResolvedValue({
      declarationId: 1,
      emailAutresDestinataires: ["autre@autre.com"],
    });
    jest.spyOn(yup, "object").mockImplementation(() => ({
      validate: (parametre) => {
        return parametre;
      },
    }));
    getEmails.mockResolvedValue({});

    const response = await request(app)
      .post("/eig/depose/1")
      .send({ parametre: { declarationId: 1 } });
    expect(response.statusCode).toBe(200);
    expect(eigService.depose).toHaveBeenCalled();
    expect(MailUtils.bo.eig.sendToAutre).toHaveBeenCalled();

    getEmails.mockResolvedValue({ emailsDDETS: ["a@a.com"] });
    await request(app)
      .post("/eig/depose/1")
      .send({ parametre: { declarationId: 1 } });
    expect(MailUtils.bo.eig.sendToDDETS).toHaveBeenCalledTimes(1);
    expect(MailUtils.bo.eig.sendToDREETS).toHaveBeenCalledTimes(0);
    expect(MailUtils.bo.eig.sendToOrganisme).toHaveBeenCalledTimes(0);

    getEmails.mockResolvedValue({ emailsDREETS: ["a@a.com"] });
    await request(app)
      .post("/eig/depose/1")
      .send({ parametre: { declarationId: 1 } });
    expect(MailUtils.bo.eig.sendToDDETS).toHaveBeenCalledTimes(1);
    expect(MailUtils.bo.eig.sendToDREETS).toHaveBeenCalledTimes(1);
    expect(MailUtils.bo.eig.sendToOrganisme).toHaveBeenCalledTimes(0);

    getEmails.mockResolvedValue({ emailsOrganisateur: ["a@a.com"] });
    await request(app)
      .post("/eig/depose/1")
      .send({ parametre: { declarationId: 1 } });
    expect(MailUtils.bo.eig.sendToDDETS).toHaveBeenCalledTimes(1);
    expect(MailUtils.bo.eig.sendToDREETS).toHaveBeenCalledTimes(1);
    expect(MailUtils.bo.eig.sendToOrganisme).toHaveBeenCalledTimes(1);
  });
});
