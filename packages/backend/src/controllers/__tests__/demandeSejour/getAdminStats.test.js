/**
 * @file getAdminStats.test.js
 */

jest.mock("../../../repositories/usagers/DemandeSejour", () => ({
  DemandeSejourRepository: {
    getAdminStats: jest.fn(),
  },
}));

jest.mock("../../../utils/logger", () => () => ({
  i: jest.fn(),
  w: jest.fn(),
}));

const {
  DemandeSejourRepository,
} = require("../../../repositories/usagers/DemandeSejour");
const getAdminStats = require("../../demandeSejour/getAdminStats");

describe("getAdminStats controller", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      decoded: { territoireCode: "PAC" },
      departements: [{ value: "13" }, { value: "84" }],
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };

    next = jest.fn();
  });

  test("devrait appeler le repository et retourner le JSON attendu", async () => {
    const fakeStats = { enCours: 3, global: 10 };

    DemandeSejourRepository.getAdminStats.mockResolvedValue({
      stats: fakeStats,
    });

    await getAdminStats(req, res, next);

    // Vérifie que le repository a été appelé correctement
    expect(DemandeSejourRepository.getAdminStats).toHaveBeenCalledWith({
      departementCodes: ["13", "84"],
      territoireCode: "PAC",
    });

    // Vérifie la réponse
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ stats: fakeStats });
    expect(next).not.toHaveBeenCalled();
  });

  test("devrait gérer les erreurs et appeler next(error)", async () => {
    const fakeError = new Error("DB error");

    DemandeSejourRepository.getAdminStats.mockRejectedValue(fakeError);

    await getAdminStats(req, res, next);

    // Vérifie que l'erreur est transmise à next()
    expect(next).toHaveBeenCalledWith(fakeError);
    expect(res.status).not.toHaveBeenCalled();
  });
});
