const { isDeclarationligibleToEig } = require("../eig");
const { DEMANDE_SEJOUR_STATUTS } = require("@vao/shared-bridge");
const { expect } = require("@playwright/test");

describe("isDeclarationligibleToEig", () => {
  const declaration = {
    dateDebut: "2024-09-01",
    dateFin: "2024-09-07",
    id: 26,
    libelle: "declaration1",
  };

  const allStatuts = Object.values(DEMANDE_SEJOUR_STATUTS);

  const okStatuts = [
    DEMANDE_SEJOUR_STATUTS.SEJOUR_EN_COURS,
    DEMANDE_SEJOUR_STATUTS.VALIDEE_8J,
    DEMANDE_SEJOUR_STATUTS.TERMINEE,
  ];

  const badStatus = allStatuts.filter((s) => !okStatuts.includes(s));

  it.each(okStatuts)(
    "should return true for statut %p and good date range",
    (statut) => {
      declaration.statut = statut;
      jest.useFakeTimers().setSystemTime(new Date("2024-09-01"));
      expect(isDeclarationligibleToEig(declaration)).toBe(true);

      jest.useFakeTimers().setSystemTime(new Date("2024-09-06"));
      expect(isDeclarationligibleToEig(declaration)).toBe(true);

      jest.useFakeTimers().setSystemTime(new Date("2024-09-07"));
      expect(isDeclarationligibleToEig(declaration)).toBe(true);

      jest.useFakeTimers().setSystemTime(new Date("2024-09-14"));
      expect(isDeclarationligibleToEig(declaration)).toBe(true);
    },
  );

  it.each(badStatus)(
    "should return false for statut %p and good date range",
    (statut) => {
      declaration.statut = statut;
      jest.useFakeTimers().setSystemTime(new Date("2024-09-01"));
      expect(isDeclarationligibleToEig(declaration)).toBe(false);

      jest.useFakeTimers().setSystemTime(new Date("2024-09-06"));
      expect(isDeclarationligibleToEig(declaration)).toBe(false);

      jest.useFakeTimers().setSystemTime(new Date("2024-09-07"));
      expect(isDeclarationligibleToEig(declaration)).toBe(false);

      jest.useFakeTimers().setSystemTime(new Date("2024-09-14"));
      expect(isDeclarationligibleToEig(declaration)).toBe(false);
    },
  );

  it.each(allStatuts)(
    "should return false for statut %p and bad date range",
    (statut) => {
      declaration.statut = statut;
      jest.useFakeTimers().setSystemTime(new Date("2024-08-31"));
      expect(isDeclarationligibleToEig(declaration)).toBe(false);

      jest.useFakeTimers().setSystemTime(new Date("2024-09-15"));
      expect(isDeclarationligibleToEig(declaration)).toBe(false);
    },
  );
});
