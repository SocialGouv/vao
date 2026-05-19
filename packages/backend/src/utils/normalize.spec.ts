import { normalize } from "./normalize";

describe("utils/normalize", () => {
  it("devrait mettre la chaîne en minuscules", () => {
    expect(normalize("HELLO")).toBe("hello");
  });

  it("devrait retirer les accents", () => {
    expect(normalize("éèêëàâäîïôöùûüÿ")).toBe("eeeeaaaiioouuuy");
  });

  it("devrait retirer la cédille", () => {
    expect(normalize("Façade")).toBe("facade");
  });

  it("devrait combiner minuscules et suppression des accents", () => {
    expect(normalize("Éléphant")).toBe("elephant");
  });

  it("devrait laisser inchangée une chaîne sans accents ni majuscules", () => {
    expect(normalize("bonjour")).toBe("bonjour");
  });

  it("devrait retourner une chaîne vide pour une entrée vide", () => {
    expect(normalize("")).toBe("");
  });

  it("devrait préserver les espaces et la ponctuation", () => {
    expect(normalize("Crème brûlée !")).toBe("creme brulee !");
  });
});
