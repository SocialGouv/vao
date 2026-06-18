import { FUNCTIONAL_ERRORS } from "../constantes/errors";
import { translate } from "./translations";

describe("translate", () => {
  it("should return translation of code string", () => {
    expect(translate(FUNCTIONAL_ERRORS.AGREMENT_NOT_FOUND)).toEqual(
      "Agrement non trouvé",
    );
  });
});
