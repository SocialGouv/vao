import * as yup from "yup";

export const numTelephoneRegex = /^(\+33|0|0033)[1-9][0-9]{8}$/i;

export function telephoneYup(
  requiredMsg = "Le téléphone est requis",
  invalidMsg = "Format de numéro de téléphone invalide",
) {
  return yup
    .string()
    .required(requiredMsg)
    .matches(numTelephoneRegex, invalidMsg);
}

export function telephoneYupNullable(
  invalidMsg = "Format de numéro de téléphone invalide",
) {
  return yup
    .string()
    .test(
      "telephone",
      invalidMsg,
      (telephone) => telephone == null || numTelephoneRegex.test(telephone),
    )
    .nullable();
}
