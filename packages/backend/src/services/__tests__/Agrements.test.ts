import type { AgrementsDto } from "../../dto/AgrementsDto";
import { AgrementsRepository } from "../../repositories/usagers/Agrements";
import getByOrganismeId from "../agrements/Agrements";

// On mocke le module repository
jest.mock("../../repositories/usagers/Agrements", () => ({
  AgrementsRepository: {
    getByOrganismeId: jest.fn(),
  },
}));

describe("Service: getByOrganismeId", () => {
  const mockAgrement: AgrementsDto = {
    dateDebut: "2025-01-01",
    dateFin: "2025-12-31",
    id: 123,
    organismeId: 1,
    statut: "VALIDE",
  } as unknown as AgrementsDto;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait appeler AgrementsRepository.getByOrganismeId avec le bon id", async () => {
    (AgrementsRepository.getByOrganismeId as jest.Mock).mockResolvedValue({
      agrement: mockAgrement,
    });

    const organismeId = 42;
    await getByOrganismeId({ organismeId });

    expect(AgrementsRepository.getByOrganismeId).toHaveBeenCalledTimes(1);
    expect(AgrementsRepository.getByOrganismeId).toHaveBeenCalledWith({
      organismeId,
    });
  });

  it("devrait retourner un objet contenant l'agrement", async () => {
    (AgrementsRepository.getByOrganismeId as jest.Mock).mockResolvedValue({
      agrement: mockAgrement,
    });

    const result = await getByOrganismeId({ organismeId: 99 });

    expect(result).toEqual({ agrement: mockAgrement });
  });

  it("devrait propager une erreur si le repository échoue", async () => {
    (AgrementsRepository.getByOrganismeId as jest.Mock).mockRejectedValue(
      new Error("Erreur DB"),
    );

    await expect(getByOrganismeId({ organismeId: 10 })).rejects.toThrow(
      "Erreur DB",
    );
  });
});
