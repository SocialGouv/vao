import axios from "axios";

import { getEtablissement } from "./Insee";

describe("getEtablissement", () => {
  const siret = "12345678901234";

  it("devrait retourner un établissement valide pour un SIRET valide", async () => {
    (axios.get as jest.Mock).mockResolvedValue({
      data: { etablissement: { nom: "Test Etablissement", siret } },
    });

    const result = await getEtablissement(siret);
    expect(result).toEqual({ nom: "Test Etablissement", siret });
  });

  it("devrait retourner null pour un SIRET non trouvé (404)", async () => {
    (axios.get as jest.Mock).mockRejectedValue({ response: { status: 404 } });

    const result = await getEtablissement(siret);
    expect(result).toBeNull();
  });

  it("devrait lever une exception pour une erreur réseau", async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

    await expect(getEtablissement(siret)).rejects.toThrow("Network Error");
  });

  it("devrait retourner null si l'établissement est absent dans la réponse", async () => {
    (axios.get as jest.Mock).mockResolvedValue({ data: {} });

    const result = await getEtablissement(siret);
    expect(result).toBeNull();
  });
});
