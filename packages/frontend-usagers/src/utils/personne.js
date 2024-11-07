import * as yup from "yup";
import dayjs from "dayjs";
import regex from "./regex";
import { informationsPersonnelListe } from "#imports";
import { adresseSchema } from "@vao/shared/src/schema/adresse";

const schema = ({
  showAdresse,
  showAttestation,
  showCompetence,
  showDateNaissance,
  showEmail,
  showFonction,
  showListeFonction,
  showTelephone,
}) => {
  return {
    nom: yup
      .string()
      .test("acceptedChars", "Caractères non acceptés détectés", (nom) =>
        regex.acceptedCharsRegex.test(nom),
      )
      .test(
        "doubleSpaces",
        "Le nom ne peut contenir deux espaces successifs",
        (nom) => !regex.doubleSpacesRegex.test(nom),
      )
      .test(
        "spaceFollowingDash",
        "Le nom ne peut contenir d'espace suivant un tiret",
        (nom) => !regex.spaceFollowingDashRegex.test(nom),
      )
      .test(
        "tripleDash",
        "Le nom ne peut contenir trois tirets consécutifs",
        (nom) => !regex.tripleDashRegex.test(nom),
      )
      .required(),
    prenom: yup
      .string()
      .test("acceptedChars", "Caractères non acceptés détectés", (prenom) =>
        regex.acceptedCharsRegex.test(prenom),
      )
      .test(
        "doubleSpaces",
        "Le prénom ne peut contenir deux espaces successifs",
        (prenom) => !regex.doubleSpacesRegex.test(prenom),
      )
      .test(
        "spaceFollowingDash",
        "Le prénom ne peut contenir d'espace suivant un tiret",
        (prenom) => !regex.spaceFollowingDashRegex.test(prenom),
      )
      .test(
        "doubleDash",
        "Le prénom ne peut contenir deux tirets consécutifs",
        (prenom) => !regex.doubleDashRegex.test(prenom),
      )
      .required(),

    ...(showAdresse && {
      adresse: yup.object({
        ...adresseSchema(),
      }),
    }),
    ...(showAttestation && {
      attestation: yup
        .boolean()
        .oneOf([true], "Vous devez certifier de ces informations")
        .required(),
    }),
    ...(showCompetence && {
      competence: yup.string().required(),
    }),
    ...(showDateNaissance && {
      dateNaissance: yup
        .date()
        .typeError("La date n'est pas au format attendu")
        .max(
          dayjs(),
          "La date de naissance ne peut être supérieure à la date du jour",
        )
        .min(
          dayjs("1920-01-01"),
          "La date de naissance ne peut être inférieure au 01/01/1920",
        )
        .required(),
    }),
    ...(showEmail && {
      email: yup
        .string()
        .test(
          "email",
          "l'adresse de courriel n'est pas au format attendu",
          (email) => regex.emailRegex.test(email),
        )
        .required(),
    }),
    ...(showFonction && {
      fonction: yup.string().required(),
    }),
    ...(showListeFonction && {
      listeFonction: yup
        .array()
        .of(
          yup.string().oneOf(
            informationsPersonnelListe.fonctionOptions.map((o) => o.value),
            "la valeur insérée ne fait pas partie de la liste des possibles",
          ),
        )
        .required(),
    }),
    ...(showTelephone && {
      telephone: yup
        .string()
        .test(
          "telephone",
          "Format de numéro de téléphone invalide",
          (telephone) => regex.numTelephoneRegex.test(telephone),
        )
        .required(),
    }),
  };
};

export default {
  schema,
};
