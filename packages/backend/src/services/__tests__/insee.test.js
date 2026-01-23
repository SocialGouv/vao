const axios = require("axios");
const { getEtablissement } = require("../Insee");

jest.mock("axios");

jest.mock("../../utils/logger", () => {
  return jest.fn(() => ({
    e: jest.fn(),
    i: jest.fn(),
    w: jest.fn(),
  }));
});

describe("getEtablissement", () => {
  const siret = "12345678901234";

  it("devrait retourner un établissement valide pour un SIRET valide", async () => {
    axios.get.mockResolvedValue({
      data: { etablissement: { nom: "Test Etablissement", siret } },
    });

    const result = await getEtablissement(siret);
    expect(result).toEqual({ nom: "Test Etablissement", siret });
  });

  it("devrait retourner null pour un SIRET non trouvé (404)", async () => {
    axios.get.mockRejectedValue({ response: { status: 404 } });

    const result = await getEtablissement(siret);
    expect(result).toBeNull();
  });

  it("devrait lever une exception pour une erreur réseau", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    await expect(getEtablissement(siret)).rejects.toThrow("Network Error");
  });

  it("devrait retourner null si l'établissement est absent dans la réponse", async () => {
    axios.get.mockResolvedValue({ data: {} });

    const result = await getEtablissement(siret);
    expect(result).toBeNull();
  });
});
