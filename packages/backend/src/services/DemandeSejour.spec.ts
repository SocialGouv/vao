/**
 * @file src/services/__tests__/DemandeSejour.test.js
 * Tests unitaires pour les fonctions getByDepartementCodes et reorgQueryParams
 */

import { DemandeSejourRepository } from "../repositories/usagers/DemandeSejour";
import { getByDepartementCodes } from "./DemandeSejour";
import { getComplementOrganisme } from "./Organisme";

jest.mock("../repositories/usagers/DemandeSejour", () => ({
  DemandeSejourRepository: {
    getAdminStats: jest.fn(),
    getByDepartementCodes: jest.fn(),
  },
}));

jest.mock("./Organisme", () => ({
  getComplementOrganisme: jest.fn(),
}));

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
    (
      DemandeSejourRepository.getByDepartementCodes as jest.Mock
    ).mockResolvedValue({
      count: 5,
      result: [{ id: 1, nom: "Séjour test" }],
    });

    (DemandeSejourRepository.getAdminStats as jest.Mock).mockResolvedValue({
      result: { global: 5 },
    });

    (getComplementOrganisme as jest.Mock).mockResolvedValue({
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
    (
      DemandeSejourRepository.getByDepartementCodes as jest.Mock
    ).mockResolvedValue({
      count: 10,
      result: [{ id: 1 }],
    });
    (DemandeSejourRepository.getAdminStats as jest.Mock).mockResolvedValue({
      stats: { global: 2 },
    });
    (getComplementOrganisme as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await getByDepartementCodes({ limit: 1, offset: 0 }, "75", [
      "75",
    ]);

    expect(result.total).toBe(10);
  });
});
