import build from "./build";

/* eslint-disable no-var -- jest hoists jest.mock(); let/const are TDZ when the factory runs */
var mockFakePdfDoc: { end: jest.Mock; on: jest.Mock };
var mockCreatePdfKitDocument: jest.Mock;
/* eslint-enable no-var */

jest.mock("pdfmake", () => {
  mockFakePdfDoc = {
    end: jest.fn(),
    on: jest.fn(),
  };
  mockCreatePdfKitDocument = jest.fn().mockReturnValue(mockFakePdfDoc);
  return jest.fn().mockImplementation(() => ({
    createPdfKitDocument: mockCreatePdfKitDocument,
  }));
});

jest.mock("../../../helpers/declaration/mise-en-page", () => ({
  MARGIN_UP_30: [0, 30, 0, 0],
  buildLines: jest.fn(() => [{ text: "fake-line" }]),
}));

jest.mock("../../../helpers/eig", () => ({
  mapEigToLabel: {
    accident: "Accident",
    autre: "Autre",
    violence: "Violence",
  },
}));

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
      adresses: ["Paris"],
      agrementRegionObtention: "REG1",
      date: "2025-06-02",
      dateDebut: "2025-06-01",
      dateFin: "2025-06-10",
      departement: "75",
      departementLibelle: "DEP",
      deroulement: "Tout s'est bien passé.",
      dispositionInformations: "Famille informée",
      dispositionRemediation: "Aucune",
      dispositionVictimes: "RAS",
      idFonctionnelle: "EIG123",
      libelle: "Séjour été",
      personnel: [
        {
          dateNaissance: "2000-01-01",
          listeFonction: ["Animateur"],
          nom: "Dupont",
          prenom: "Jean",
          telephone: "0600000000",
        },
      ],
      raisonSociale: "OVA",
      readByDdets: true,
      readByDreets: false,
      saison: "Été",
      types: [{ precision: "Mineur", type: "accident" }],
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
      adresses: [],
      agrementRegionObtention: "REG1",
      departementLibelle: "DEP",
      deroulement: "",
      dispositionInformations: "",
      dispositionRemediation: "",
      dispositionVictimes: "",
      personnel: [],
      types: [],
    };

    const buffer = await build({
      eig: fakeEig,
      serviceRegional: "Centre",
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(mockCreatePdfKitDocument).toHaveBeenCalled();
  });
});
