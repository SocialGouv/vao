const get = require("../../demandeSejour/getExtractFO");
const DemandeSejour = require("../../../services/DemandeSejour");
const Organisme = require("../../../services/Organisme");
const AppError = require("../../../utils/error").default;

jest.mock("../../../services/Organisme");
jest.mock("../../../services/DemandeSejour");

describe("Controller get() - export CSV des séjours FO", () => {
  let req, res, next;

  beforeEach(() => {
    req = { decoded: { id: 1 } };
    res = {
      send: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("retourne un CSV pour un organisme simple (non porteur)", async () => {
    // Mock d’un organisme simple
    Organisme.getOne.mockResolvedValue({
      organismeId: 123,
      personneMorale: null,
    });

    const fakeData = [
      {
        date_debut: "2024-04-01",
        date_fin: "2024-04-07",
        departement: "75",
        etablissement: "",
        hebergement_nom: "Hotel Test",
        libelle: "Séjour test",
        reference: "REF001",
        siret: "12345678901234",
        statut: "en cours",
      },
    ];

    DemandeSejour.getExtractFO.mockResolvedValue(fakeData);

    await get(req, res, next);

    // Vérifie les headers HTTP
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="data.csv"',
    );

    // Vérifie l’appel de getExtractFO
    expect(DemandeSejour.getExtractFO).toHaveBeenCalledWith([123]);

    // Vérifie le CSV
    const csv = res.send.mock.calls[0][0];
    expect(csv).toContain("REF001");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("génère un CSV pour un organisme porteur d’agrément (avec plusieurs organismes liés)", async () => {
    // Mock organisme porteur
    Organisme.getOne.mockResolvedValue({
      organismeId: 1,
      personneMorale: { porteurAgrement: true, siren: "123456789" },
    });

    // Mock des organismes liés
    Organisme.getBySiren.mockResolvedValue([
      { organismeId: 11 },
      { organismeId: 22 },
      { organismeId: 33 },
    ]);

    const fakeData = [
      {
        date_debut: "2024-05-01",
        date_fin: "2024-05-10",
        departement: "33",
        etablissement: "Maison d’enfants",
        hebergement_nom: "Centre A",
        libelle: "Séjour collectif",
        reference: "REF002",
        siret: "98765432100012",
        statut: "transmise",
      },
    ];

    DemandeSejour.getExtractFO.mockResolvedValue(fakeData);

    await get(req, res, next);

    // Vérifie la récupération des IDs
    expect(DemandeSejour.getExtractFO).toHaveBeenCalledWith([11, 22, 33]);

    const csv = res.send.mock.calls[0][0];
    expect(csv).toContain("REF002");
  });

  it("retourne une erreur 400 si aucun organisme n’est trouvé", async () => {
    // Mock sans organisme
    Organisme.getOne.mockResolvedValue(undefined);

    await get(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.message).toBe("Organisme non trouvé pour cet utilisateur");
    expect(err.statusCode).toBe(400);
  });

  it("appelle next(error) en cas d’erreur inattendue", async () => {
    // Force une exception
    Organisme.getOne.mockRejectedValue(new Error("DB Error"));

    await get(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("DB Error");
  });
});
