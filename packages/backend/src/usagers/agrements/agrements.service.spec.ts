import { AgrementsRepository } from "./agrements.repository";
import { AgrementService } from "./agrements.service";

// On mocke le module repository
jest.mock("./agrements.repository", () => ({
  AgrementsRepository: {
    getAllActivites: jest.fn(),
    getByOrganismeId: jest.fn(),
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
    (AgrementsRepository.getAllActivites as jest.Mock).mockResolvedValue(
      mockActivites,
    );

    const result = await AgrementService.getAllActivites();

    expect(AgrementsRepository.getAllActivites).toHaveBeenCalledTimes(1);

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
    (AgrementsRepository.getAllActivites as jest.Mock).mockRejectedValue(
      new Error("Erreur DB"),
    );

    await expect(AgrementService.getAllActivites()).rejects.toThrow(
      "Erreur DB",
    );
  });
});
