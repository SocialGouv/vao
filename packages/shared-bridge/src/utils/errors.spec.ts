import { ERRORS_SIRET, ERRORS_SIRET_MESSAGES } from "../constantes";
import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
  it("should return the mapped message for a known error", () => {
    expect(getErrorMessage(ERRORS_SIRET.SiretError)).toEqual(
      ERRORS_SIRET_MESSAGES[ERRORS_SIRET.SiretError],
    );
  });

  it("should return a default message when the error is unknown", () => {
    expect(getErrorMessage("NOT_A_REAL_ERROR" as ERRORS_SIRET)).toEqual(
      "Une erreur inconnue est survenue.",
    );
  });
});
