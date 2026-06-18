import { ERRORS_SIRET, ERRORS_SIRET_MESSAGES } from "../constantes";
import { FunctionalException, getErrorMessage } from "./errors";

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

describe("FunctionalException", () => {
  it("should set the correct name", () => {
    const error = new FunctionalException("MY_CODE");
    expect(error.name).toBe("FunctionalException");
  });

  it("should set the code and message correctly", () => {
    const error = new FunctionalException("MY_CODE");

    expect(error.code).toBe("MY_CODE");
    expect(error.message).toBe("MY_CODE");
  });

  it("should be an instance of Error", () => {
    const error = new FunctionalException("MY_CODE");

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FunctionalException);
  });

  it("should have a stack trace", () => {
    const error = new FunctionalException("MY_CODE");

    expect(error.stack).toBeDefined();
  });
});
