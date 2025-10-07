import { string } from "yup";
import { numTelephoneRegex } from "../utils/regex";

export const telephoneSchema = () =>
  string()
    .test(
      "telephone",
      "Format de numéro de téléphone invalide",
      (telephone) => {
        return telephone === null || numTelephoneRegex.test(telephone);
      },
    )
    .required();
