const get = require("../getListeExtract");
const Organisme = require("../../../services/Organisme");
const { formatSiren, formatSiret } = require("@vao/shared-bridge");
const { escapeCsvField } = require("../../../utils/csv");
const dayjs = require("dayjs");

jest.mock("../../../services/Organisme");
jest.mock("@vao/shared-bridge");
jest.mock("../../../utils/csv");
jest.mock("../../../utils/logger", () =>
  jest.fn(() => ({
    i: jest.fn(),
    w: jest.fn(),
  })),
);

describe("Controller get() - export CSV des organismes", () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      send: jest.fn(),
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    formatSiren.mockImplementation(({ siren }) => `SIREN_FORMATTED_${siren}`);
    formatSiret.mockImplementation(({ siret }) => `SIRET_FORMATTED_${siret}`);
    escapeCsvField.mockImplementation((v) => v);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("retourne un CSV formaté correctement avec les bons en-têtes", async () => {
    const fakeOrganismes = [
      {
        agrement: { dateObtention: "2024-05-01", regionObtention: "Occitanie" },
        complet: true,
        editedAt: "2024-06-01",
        email: "test@example.com",
        nomPersonnePhysique: "",
        prenomPersonnePhysique: "",
        raisonSociale: "Entreprise Test",
        sejourCount: 5,
        sejourCountTransmise: 2,
        siren: "123456789",
        siret: "12345678901234",
        telephone: "0123456789",
        typeOrganisme: "personne_morale",
      },
      {
        agrement: {
          dateObtention: "2025-01-01",
          regionObtention: "Hauts-de-France",
        },
        complet: true,
        editedAt: "2025-01-15",
        email: "test2@example.com",
        nomPersonnePhysique: "",
        prenomPersonnePhysique: "",
        raisonSociale: "Individuel Test",
        sejourCount: 2,
        sejourCountTransmise: 1,
        siren: "987654321",
        siret: "98765432109876",
        telephone: "0198765432",
        typeOrganisme: "personne_physique",
      },
    ];

    Organisme.getListeExtract.mockResolvedValue(fakeOrganismes);

    await get(req, res, next);

    // Vérifie les headers HTTP
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "text/csv");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="data.csv"',
    );

    // Vérifie le formatage et l’appel à formatSiren / formatSiret
    expect(formatSiret).toHaveBeenCalledWith({ siret: "12345678901234" });
    expect(formatSiren).toHaveBeenCalledWith({ siren: "123456789" });

    // Vérifie que le CSV contient les bons en-têtes
    const csvContent = res.send.mock.calls[0][0];
    expect(csvContent.startsWith('"Type";"Date de modification"')).toBe(true);

    // Vérifie les valeurs transformées dans la ligne
    expect(csvContent).toContain("personne morale");
    expect(csvContent).toContain("SIREN_FORMATTED_123456789");
    expect(csvContent).toContain("SIRET_FORMATTED_12345678901234");
    expect(csvContent).toContain(dayjs("2024-05-01").format("DD/MM/YYYY"));
    expect(csvContent).toContain(dayjs("2024-06-01").format("DD/MM/YYYY"));
    expect(csvContent).toContain("oui");

    // Vérifie que la réponse est bien envoyée avec le statut 200
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledTimes(1);
  });

  it("gère correctement les erreurs via next()", async () => {
    const fakeError = new Error("Erreur DB");
    Organisme.getListeExtract.mockRejectedValue(fakeError);

    await get(req, res, next);

    // Vérifie que next() est bien appelé avec l’erreur
    expect(next).toHaveBeenCalledWith(fakeError);
  });
});
