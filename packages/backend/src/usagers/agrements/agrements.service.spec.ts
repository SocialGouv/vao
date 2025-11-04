import type { AgrementsDto } from "../../dto/AgrementsDto";
import { AgrementsRepository } from "./agrements.repository";
import { AgrementService } from "./agrements.service";

// On mocke le module repository
jest.mock("./agrements.repository", () => ({
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

  const mockWithDetail: boolean = true;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("devrait appeler AgrementsRepository.getByOrganismeId avec le bon id", async () => {
    (AgrementsRepository.getByOrganismeId as jest.Mock).mockResolvedValue({
      agrement: mockAgrement,
      withDetail: mockWithDetail,
    });

    const organismeId = 42;
    const withDetails = true;
    await AgrementService.getAgrement({
      organismeId,
      withDetails,
    });

    expect(AgrementsRepository.getByOrganismeId).toHaveBeenCalledTimes(1);
    expect(AgrementsRepository.getByOrganismeId).toHaveBeenCalledWith({
      organismeId,
      withDetails,
    });
  });

  it("devrait retourner un objet contenant l'agrement", async () => {
    (AgrementsRepository.getByOrganismeId as jest.Mock).mockResolvedValue({
      agrement: mockAgrement,
    });

    const result = await AgrementService.getAgrement({
      organismeId: 99,
      withDetails: true,
    });

    expect(result).toEqual({ agrement: mockAgrement });
  });

  it("devrait propager une erreur si le repository échoue", async () => {
    (AgrementsRepository.getByOrganismeId as jest.Mock).mockRejectedValue(
      new Error("Erreur DB"),
    );

    await expect(
      AgrementService.getAgrement({ organismeId: 10, withDetails: true }),
    ).rejects.toThrow("Erreur DB");
  });
});
