const mockFakePdfDoc = {
  on: jest.fn(),
  end: jest.fn(),
};
const mockCreatePdfKitDocument = jest.fn().mockReturnValue(mockFakePdfDoc);

jest.mock("pdfmake", () => {
  return jest.fn().mockImplementation(() => ({
    createPdfKitDocument: mockCreatePdfKitDocument,
  }));
});

jest.mock("../../../../utils/logger", () => {
  return jest.fn(() => ({
    i: jest.fn(),
    w: jest.fn(),
  }));
});

jest.mock("../../../../helpers/declaration/mise-en-page", () => ({
  buildLines: jest.fn(() => [{ text: "fake-line" }]),
  MARGIN_UP_30: [0, 30, 0, 0],
}));

jest.mock("../../../../helpers/eig", () => ({
  mapEigToLabel: {
    accident: "Accident",
    violence: "Violence",
    autre: "Autre",
  },
}));

const build = require("../../../../services/pdf/eig/build");

describe("Service PDF EIG - build()", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockFakePdfDoc.on.mockImplementation((event, handler) => {
      if (event === "data") handler(Buffer.from("FAKE_DATA"));
      if (event === "end") handler();
    });
  });

  it("devrait créer un PDF avec le contenu attendu et renvoyer un buffer", async () => {
    const fakeEig = {
      idFonctionnelle: "EIG123",
      agrementRegionObtention: "REG1",
      departementLibelle: "DEP",
      departement: "75",
      raisonSociale: "OVA",
      libelle: "Séjour été",
      dateDebut: "2025-06-01",
      dateFin: "2025-06-10",
      saison: "Été",
      adresses: ["Paris"],
      date: "2025-06-02",
      deroulement: "Tout s'est bien passé.",
      dispositionRemediation: "Aucune",
      dispositionVictimes: "RAS",
      dispositionInformations: "Famille informée",
      readByDdets: true,
      readByDreets: false,
      personnel: [
        {
          nom: "Dupont",
          prenom: "Jean",
          dateNaissance: "2000-01-01",
          listeFonction: ["Animateur"],
          telephone: "0600000000",
        },
      ],
      types: [{ type: "accident", precision: "Mineur" }],
    };

    const buffer = await build({
      eig: fakeEig,
      serviceRegional: "Île-de-France",
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);

    expect(mockCreatePdfKitDocument).toHaveBeenCalled();
  });

  it("devrait gérer un eig minimal sans personnel ni types", async () => {
    const fakeEig = {
      agrementRegionObtention: "REG1",
      departementLibelle: "DEP",
      adresses: [],
      personnel: [],
      types: [],
      deroulement: "",
      dispositionRemediation: "",
      dispositionVictimes: "",
      dispositionInformations: "",
    };

    const buffer = await build({
      eig: fakeEig,
      serviceRegional: "Centre",
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(mockCreatePdfKitDocument).toHaveBeenCalled();
  });
});
