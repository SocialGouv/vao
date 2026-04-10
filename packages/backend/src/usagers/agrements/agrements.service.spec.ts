import { AgrementsRepositoryShared } from "../../shared/agrements/agrements.repository";
import { AgrementService } from "./agrements.service";

// On mocke le module repository

jest.mock("../../shared/agrements/agrements.repository", () => ({
  AgrementsRepositoryShared: {
    getAllActivites: jest.fn(),
  },
}));

describe("Service: getAllActivites", () => {
  const mockActivites = [
    {
      activite_type: "SPORT",
      code: "BAIGNADE",
      id: 1,
      libelle: "Baignade",
    },
    {
      activite_type: "SPORT",
      code: "RANDONNEE",
      id: 2,
      libelle: "Randonnée",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait appeler AgrementsRepository.getAllActivites et retourner les activités", async () => {
    (AgrementsRepositoryShared.getAllActivites as jest.Mock).mockResolvedValue(
      mockActivites,
    );

    const result = await AgrementService.getAllActivites();

    expect(AgrementsRepositoryShared.getAllActivites).toHaveBeenCalledTimes(1);

    expect(result).toEqual([
      {
        activiteType: "SPORT",
        code: "BAIGNADE",
        id: 1,
        libelle: "Baignade",
      },
      {
        activiteType: "SPORT",
        code: "RANDONNEE",
        id: 2,
        libelle: "Randonnée",
      },
    ]);
  });

  it("devrait propager une erreur si le repository échoue", async () => {
    (AgrementsRepositoryShared.getAllActivites as jest.Mock).mockRejectedValue(
      new Error("Erreur DB"),
    );

    await expect(AgrementService.getAllActivites()).rejects.toThrow(
      "Erreur DB",
    );
  });
});
