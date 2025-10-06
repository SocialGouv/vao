const { formatSiren, formatSiret } = require("../siret");

describe("Siret", () => {
  it("Devrait retourner un siret correctement formatté", () => {
    expect(formatSiret({ siret: "12345678901234" })).toBe("123 456 789 01234");
  });
  it("devrait retourner l'entrée telle quelle si non numérique", () => {
    expect(formatSiret({ siret: "123456789ABCDE" })).toBe("123456789ABCDE");
  });
});
describe("Siren", () => {
  it("Devrait retourner un siren correctement formatté", () => {
    expect(formatSiren({ siren: "123456789" })).toBe("123 456 789");
  });
  it("devrait retourner l'entrée telle quelle si non numérique", () => {
    expect(formatSiren({ siren: "12345ABCDE" })).toBe("12345ABCDE");
  });
});
