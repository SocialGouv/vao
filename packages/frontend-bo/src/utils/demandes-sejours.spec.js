import { describe, it, expect } from "vitest";
import demandeSejours from "./demandes-sejours";

import { organisme } from "#imports";

describe("getSaison", () => {
  it("should return Hiver for dates in January", () => {
    const demande = { dateDebut: "2023-01-15" };
    expect(demandeSejours.getSaison(demande)).toBe("Hiver");
  });

  it("should return Printemps for dates in April", () => {
    const demande = { dateDebut: "2023-04-15" };
    expect(demandeSejours.getSaison(demande)).toBe("Printemps");
  });

  it("should return Eté for dates in July", () => {
    const demande = { dateDebut: "2023-07-15" };
    expect(demandeSejours.getSaison(demande)).toBe("Eté");
  });

  it("should return Automne for dates in October", () => {
    const demande = { dateDebut: "2023-10-15" };
    expect(demandeSejours.getSaison(demande)).toBe("Automne");
  });

  it("should return undefined if dateDebut is missing", () => {
    const demande = {};
    expect(demandeSejours.getSaison(demande)).toBeUndefined();
  });
});

describe("isDeclaration8Jours", () => {
  it("should return true for TRANSMISE_8J status", () => {
    expect(
      demandeSejours.isDeclaration8Jours(demandeSejours.statuts.TRANSMISE_8J),
    ).toBe(true);
  });

  it("should return true for VALIDEE_8J status", () => {
    expect(
      demandeSejours.isDeclaration8Jours(demandeSejours.statuts.VALIDEE_8J),
    ).toBe(true);
  });

  it("should return false for a non-8J status", () => {
    expect(demandeSejours.isDeclaration8Jours("ANOTHER_STATUS")).toBe(false);
  });
});

describe("getOrganismeTitle", () => {
  it("should return the full name for a PERSONNE_PHYSIQUE", () => {
    const demande = {
      typeOrganisme: organisme.type.PERSONNE_PHYSIQUE,
      personnePhysique: {
        prenom: "John",
        nomUsage: "Doe",
        nomNaissance: "Smith",
      },
    };
    expect(demandeSejours.getOrganismeTitle(demande)).toBe("John Doe");
  });

  it("should return the birth name if nomUsage is missing for a PERSONNE_PHYSIQUE", () => {
    const demande = {
      typeOrganisme: organisme.type.PERSONNE_PHYSIQUE,
      personnePhysique: { prenom: "John", nomNaissance: "Smith" },
    };
    expect(demandeSejours.getOrganismeTitle(demande)).toBe("John Smith");
  });

  it("should return the raisonSociale for a PERSONNE_MORALE", () => {
    const demande = {
      typeOrganisme: organisme.type.PERSONNE_MORALE,
      personneMorale: { raisonSociale: "Acme Corp" },
    };
    expect(demandeSejours.getOrganismeTitle(demande)).toBe("Acme Corp");
  });
});

describe("getDateDebutFin", () => {
  it("should return the formatted date range", () => {
    const demande = { dateDebut: "2023-07-01", dateFin: "2023-07-15" };
    expect(demandeSejours.getDateDebutFin(demande)).toBe(
      "01/07/2023 - 15/07/2023",
    );
  });
});
