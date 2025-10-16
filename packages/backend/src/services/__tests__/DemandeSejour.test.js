/**
 * @file src/services/__tests__/DemandeSejour.test.js
 * Tests unitaires pour les fonctions getByDepartementCodes et reorgQueryParams
 */

jest.mock("../../repositories/usagers/DemandeSejour", () => ({
  DemandeSejourRepository: {
    getAdminStats: jest.fn(),
    getByDepartementCodes: jest.fn(),
  },
}));

jest.mock("../Organisme", () => ({
  getComplementOrganisme: jest.fn(),
}));

const { getByDepartementCodes, _test } = require("../DemandeSejour");
const {
  DemandeSejourRepository,
} = require("../../repositories/usagers/DemandeSejour");
const { getComplementOrganisme } = require("../Organisme");

describe("reorgQueryParams", () => {
  const { reorgQueryParams } = _test; // export conditionnel dans le code source

  test("devrait fusionner correctement les queryParams avec search", () => {
    const input = {
      limit: 10,
      offset: 0,
      search: {
        organismeId: "123",
        statuts: "EN_COURS,TERMINEE",
      },
    };

    const result = reorgQueryParams(input);

    expect(result).toEqual({
      limit: 10,
      offset: 0,
      organismeId: 123,
      statuts: ["EN_COURS", "TERMINEE"],
    });
  });

  test("devrait gérer les queryParams sans search", () => {
    const input = { limit: 5 };
    const result = reorgQueryParams(input);
    expect(result).toEqual({ limit: 5 });
  });

  test("devrait supprimer la clé 'search' du résultat final", () => {
    const input = { search: { organismeId: "42" } };
    const result = reorgQueryParams(input);
    expect(result.search).toBeUndefined();
  });
});

describe("getByDepartementCodes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("devrait retourner des valeurs vides si departementCodes est une liste vide", async () => {
    const result = await getByDepartementCodes({}, "75", []);

    expect(result).toEqual({
      demandes_sejour: [],
      stats: {
        declaration8J: 0,
        enCours: 0,
        enCours8J: 0,
        global: 0,
        nonFinalisees: 0,
        terminee: 0,
        transmis: 0,
        transmis8J: 0,
        validee8J: 0,
      },
      total: 0,
    });
  });

  test("devrait appeler les repositories et retourner les résultats attendus", async () => {
    // 🔹 Données mockées
    DemandeSejourRepository.getByDepartementCodes.mockResolvedValue({
      count: 5,
      result: [{ id: 1, nom: "Séjour test" }],
    });

    DemandeSejourRepository.getAdminStats.mockResolvedValue({
      stats: { global: 5 },
    });

    getComplementOrganisme.mockResolvedValue({
      id: 1,
      nom: "Séjour test",
      organisme: "Organisme test",
    });

    const queryParams = { limit: 10, offset: 0, search: { organismeId: "42" } };
    const territoireCode = "AURA";
    const departementCodes = ["13", "84"];

    const result = await getByDepartementCodes(
      queryParams,
      territoireCode,
      departementCodes,
    );

    expect(DemandeSejourRepository.getByDepartementCodes).toHaveBeenCalledTimes(
      1,
    );
    expect(getComplementOrganisme).toHaveBeenCalledTimes(1);
    expect(result.demandes_sejour).toEqual([
      { id: 1, nom: "Séjour test", organisme: "Organisme test" },
    ]);
    expect(result.stats).toEqual({ global: 5 });
    expect(result.total).toBeGreaterThan(0);
  });

  test("devrait utiliser le count si la limite est atteinte", async () => {
    DemandeSejourRepository.getByDepartementCodes.mockResolvedValue({
      count: 10,
      result: [{ id: 1 }],
    });
    DemandeSejourRepository.getAdminStats.mockResolvedValue({
      stats: { global: 2 },
    });
    getComplementOrganisme.mockResolvedValue({ id: 1 });

    const result = await getByDepartementCodes({ limit: 1, offset: 0 }, "75", [
      "75",
    ]);

    expect(result.total).toBe(10);
  });
});
