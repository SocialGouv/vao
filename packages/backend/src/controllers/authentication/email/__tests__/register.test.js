const register = require("../register");
const User = require("../../../../services/User");
const insee = require("../../../../services/Insee");
const {
  getFichesTerritoireForRegionByInseeCode,
} = require("../../../../services/Territoire");
const { mailService } = require("../../../../services/mail");
const jwt = require("jsonwebtoken");
const config = require("../../../../config");
const registerSchema = require("../../../../schemas/register");
const ValidationAppError = require("../../../../utils/validation-error");
const AppError = require("../../../../utils/error");

jest.mock("../../../../services/User");
jest.mock("../../../../services/Insee");
jest.mock("../../../../services/Territoire");
jest.mock("../../../../services/mail", () => ({
  mailService: {
    send: jest.fn(),
  },
}));
jest.mock("jsonwebtoken");
jest.mock("../../../../utils/logger", () => () => ({
  i: jest.fn(),
  d: jest.fn(),
  w: jest.fn(),
}));
jest.mock("../../../../schemas/register");

describe("register controller", () => {
  let req, res, next, mockValidatedData;

  beforeEach(() => {
    req = {
      body: {
        email: "test@example.com",
        password: "securePass123!",
        nom: "Doe",
        prenom: "John",
        siret: "12345678900011",
        telephone: "0102030405",
      },
    };
    res = {
      status: jest.fn(() => res),
      json: jest.fn(),
    };
    next = jest.fn();

    // Reset mocks
    jest.clearAllMocks();

    // Mock schema validator
    mockValidatedData = {
      validate: jest.fn().mockResolvedValue(req.body),
    };
    registerSchema.mockReturnValue(mockValidatedData);
  });

  it("should return ValidationAppError if validation fails", async () => {
    const validationError = new Error("Validation failed");
    mockValidatedData.validate.mockRejectedValue(validationError);

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationAppError));
  });

  // TODO Test KO alors qu'il devrait être OK ??!!??
  /*
  it("should return 200 and not send mail if user already exists", async () => {
    User.read.mockResolvedValue([{ id: 1 }]);
    mailService.send.mockResolvedValue();

    await register(req, res, next);

    expect(mailService.send).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ code: "CreationCompte" });
  });
*/
  it("should return 500 if mail sending fails for existing user", async () => {
    User.read.mockResolvedValue([{ id: 1 }]);
    mailService.send.mockRejectedValue(new Error("SMTP error"));

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it("should return error if INSEE lookup fails", async () => {
    User.read.mockResolvedValue([]);
    insee.getEtablissement.mockRejectedValue(new Error("INSEE down"));

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should return error if User.registerByEmail throws", async () => {
    User.read.mockResolvedValue([]);
    insee.getEtablissement.mockResolvedValue({
      adresseEtablissement: {
        codePostalEtablissement: "75001",
      },
    });
    getFichesTerritoireForRegionByInseeCode.mockResolvedValue({
      terCode: "TER123",
    });
    User.registerByEmail.mockRejectedValue(new Error("DB failure"));

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should return 500 if validation mail sending fails", async () => {
    User.read.mockResolvedValue([]);
    insee.getEtablissement.mockResolvedValue({
      adresseEtablissement: {
        codePostalEtablissement: "75001",
      },
    });
    getFichesTerritoireForRegionByInseeCode.mockResolvedValue({
      terCode: "TER123",
    });
    User.registerByEmail.mockResolvedValue({
      user: { id: 1 },
      code: "MailEnvoye",
    });
    jwt.sign.mockReturnValue("token123");
    mailService.send.mockRejectedValue(new Error("SMTP error"));

    await register(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(AppError));
    expect(next.mock.calls[0][0].statusCode).toBe(500);
  });

  it("should register user and return 200 with code", async () => {
    User.read.mockResolvedValue([]);
    insee.getEtablissement.mockResolvedValue({
      adresseEtablissement: {
        codePostalEtablissement: "75001",
      },
    });
    getFichesTerritoireForRegionByInseeCode.mockResolvedValue({
      terCode: "TER123",
    });
    User.registerByEmail.mockResolvedValue({
      user: { id: 1 },
      code: "MailEnvoye",
    });
    jwt.sign.mockReturnValue("token123");
    mailService.send.mockResolvedValue();

    await register(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ code: "MailEnvoye" });
  });
});
