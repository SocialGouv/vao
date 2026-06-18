import { FUNCTIONAL_ERRORS } from "../constantes/errors";

export const translate = (code: string): string => {
  switch (code) {
    case FUNCTIONAL_ERRORS.AGREMENT_NOT_FOUND:
      return "Agrement non trouvé";
    case FUNCTIONAL_ERRORS.AGREMENT_INCONSISTENT:
      return "Agrement incohérent";
    default:
      return code;
  }
};
