import * as yup from "yup";
import dayjs from "dayjs";
import regex from "./regex";
import { adresseSchema } from "@vao/shared-ui/src/schema/adresse";

const typePrestataireOptions = [
  {
    label: "Personne morale",
    value: "personne_morale",
  },
  {
    label: "Personne physique",
    value: "personne_physique",
  },
];

const schema = {
  nom: yup
    .string()
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
  adresse: yup.object().when("typePrestataire", {
    is: (val) => val === "personne_morale",
    then: () => yup.object(adresseSchema()),
    otherwise: (val) => val.nullable().strip(),
  }),
  competence: yup.string().when("typePrestataire", {
    is: (val) => val === "personne_physique",
    then: (competence) =>
      competence.min(5, "Ce champ est obligatoire").required(),
    otherwise: (competence) => competence.nullable().strip(),
  }),
  dateNaissance: yup.date().when("typePrestataire", {
    is: (val) => val === "personne_physique",
    then: (dateNaissance) =>
      dateNaissance
        .typeError("La date n'est pas au format attendu")
        .max(
          dayjs(),
          "La date de naissance ne peut être supérieure à la date du jour",
        )
        .required(),
    otherwise: (dateNaissance) => dateNaissance.nullable().strip(),
  }),
  telephone: yup
    .string()
    .test("telephone", "Format de numéro de téléphone invalide", (telephone) =>
      regex.numTelephoneRegex.test(telephone),
    )
    .required(),
  typePrestataire: yup
    .string()
    .oneOf(["personne_physique", "personne_morale"])
    .required(),
};

export default {
  schema,
  typePrestataireOptions,
};
