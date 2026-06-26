import BoUser from "../services/BoUser";
import { isUserAllowedForDroit } from "./droits";

jest.mock("../../services/BoUser");

const mockedBoUser = BoUser as jest.Mocked<typeof BoUser>;

describe("isUserAllowedForDroit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("autorise quand le vérificateur du domaine renvoie true", async () => {
    mockedBoUser.isAllowToAccessAgrement.mockResolvedValue(true);
    await expect(isUserAllowedForDroit("agrement", 1, 2)).resolves.toBe(true);
    expect(mockedBoUser.isAllowToAccessAgrement).toHaveBeenCalledWith(1, 2);
  });

  it("refuse quand le vérificateur renvoie false", async () => {
    mockedBoUser.isAllowToAccessDemandeSejour.mockResolvedValue(false);
    await expect(isUserAllowedForDroit("demande_sejour", 1, 2)).resolves.toBe(
      false,
    );
  });

  it("refuse (fail-closed) quand le vérificateur renvoie null (erreur SQL)", async () => {
    mockedBoUser.isAllowToAccessHebergement.mockResolvedValue(null);
    await expect(isUserAllowedForDroit("hebergement", 1, 2)).resolves.toBe(
      false,
    );
  });

  it("refuse (fail-closed) un domaine sans vérificateur (ex. eig)", async () => {
    await expect(isUserAllowedForDroit("eig", 1, 2)).resolves.toBe(false);
  });

  it("transmet resourceId puis userId dans le bon ordre au vérificateur", async () => {
    mockedBoUser.isAllowToAccessAgrement.mockResolvedValue(true);
    await isUserAllowedForDroit("agrement", 42, 7);
    expect(mockedBoUser.isAllowToAccessAgrement).toHaveBeenCalledWith(42, 7);
  });
});
