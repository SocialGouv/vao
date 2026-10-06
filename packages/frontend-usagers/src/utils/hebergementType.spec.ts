import { describe, it, expect } from "vitest";
import { getHebergementTypeLabel } from "./hebergementType";

describe("getHebergementTypeLabel", () => {
  it("renvoie le label correspondant à une valeur connue", () => {
    expect(getHebergementTypeLabel("hotel")).toBe("Hôtel");
    expect(getHebergementTypeLabel("meuble_tourisme")).toBe(
      "Meublé de tourisme",
    );
  });

  it("renvoie une chaîne vide pour une valeur nulle ou vide", () => {
    expect(getHebergementTypeLabel(null)).toBe("");
    expect(getHebergementTypeLabel(undefined)).toBe("");
    expect(getHebergementTypeLabel("")).toBe("");
  });

  it("renvoie la valeur telle quelle si elle est inconnue", () => {
    expect(getHebergementTypeLabel("inconnu")).toBe("inconnu");
  });
});
