import { normalize, parseAddressLabel } from "./parseAddressLabel";

describe("parseAddressLabel", () => {
  it("décompose un libellé d'adresse", () => {
    expect(
      parseAddressLabel("134 rue Gilles de Montal, 67730 La Vancelle"),
    ).toEqual({
      numero: "134",
      rue: "gilles de montal",
      typeVoie: "rue",
      ville: "67730 la vancelle",
    });
  });

  it("normalise les accents et la casse", () => {
    expect(normalize("À l'École   Rue")).toBe("a l ecole rue");
  });

  it("retourne une adresse vide pour un libellé absent", () => {
    expect(parseAddressLabel(null)).toEqual({
      numero: null,
      rue: "",
      typeVoie: null,
      ville: "",
    });
  });

  it("extrait le CP et la ville sans virgule", () => {
    expect(parseAddressLabel("152 Chemin du Lac 26190 Bouvante")).toEqual({
      numero: "152",
      rue: "du lac",
      typeVoie: "chemin",
      ville: "26190 bouvante",
    });
  });

  it("extrait CP et ville sans virgule ni numéro", () => {
    expect(parseAddressLabel("Chemin du Lac 26190 Bouvante")).toEqual({
      numero: null,
      rue: "du lac",
      typeVoie: "chemin",
      ville: "26190 bouvante",
    });
  });
});
