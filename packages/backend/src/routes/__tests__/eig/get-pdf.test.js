const getPdf = require("../../../controllers/eig/get-pdf");
const Eig = require("../../../services/eig");
const Region = require("../../../services/geo/Region");
const PdfEig = require("../../../services/pdf/eig/generate");

jest.mock("../../../services/eig");
jest.mock("../../../services/geo/Region");
jest.mock("../../../services/pdf/eig/generate");

describe("getPdf controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it("retourne 400 si id manquant", async () => {
    await getPdf(req, res, next);
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.message).toBe("Paramètre incorrect");
    expect(error.statusCode).toBe(400);
  });

  it("retourne 404 si eig non trouvé", async () => {
    req.params.id = "123";
    Eig.getById.mockResolvedValue(null);

    await getPdf(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error.message).toBe("Eig non trouvé");
    expect(error.statusCode).toBe(404);
  });

  it("retourne 200 avec le fichier PDF si tout est ok", async () => {
    req.params.id = "123";
    const fakeEig = {
      agrementRegionObtention: "REG1",
      departementLibelle: "DEP",
    };
    const fakeRegion = { text: "Région" };
    const fakeFile = Buffer.from("PDF_CONTENT");

    Eig.getById.mockResolvedValue(fakeEig);
    Region.fetchOne.mockResolvedValue(fakeRegion);
    PdfEig.mockResolvedValue(fakeFile);

    await getPdf(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ file: fakeFile });
  });

  it("gère les erreurs inattendues", async () => {
    req.params.id = "123";
    Eig.getById.mockImplementation(() => {
      throw new Error("Erreur inattendue");
    });

    await getPdf(req, res, next);

    const error = next.mock.calls[0][0];
    expect(error.message).toBe("Erreur inattendue");
  });
});
