import * as yup from "yup";
import { eigModel } from "@vao/shared";
import { personneSchema } from "./personne";

const { Types, Categorie } = eigModel;

const selectionSejourSchema = {
  declarationId: yup
    .number()
    .integer("Ce champ doit contenir un nombre entier")
    .required(),
  departement: yup.string().required("ce champ est obligatoire"),
};

const eigTypeBase = yup
  .string()
  .oneOf(
    [
      ...Object.values(Types[Categorie.VICTIMES]),
      ...Object.values(Types[Categorie.SECURITE]),
      ...Object.values(Types[Categorie.SANTE]),
      ...Object.values(Types[Categorie.FONCTIONNEMENT_ORGANISME]),
    ],
    "la valeur insérée ne fait pas partie de la liste des possibles",
  )
  .required();

const eigTypeDepose = {
  type: eigTypeBase,
  categorie: yup
    .string()
    .oneOf(
      [
        Categorie.VICTIMES,
        Categorie.SECURITE,
        Categorie.SANTE,
        Categorie.FONCTIONNEMENT_ORGANISME,
      ],
      "la valeur insérée ne fait pas partie de la liste des possibles",
    )
    .required(),
  precision: yup
    .string()
    .nullable()
    .when("type", {
      is: (type) => {
        return (
          type === Types[Categorie.VICTIMES].AUTRE ||
          type === Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE ||
          type === Types[Categorie.SECURITE].AUTRE ||
          type === Types[Categorie.SANTE].AUTRE
        );
      },
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
};

const eigTypesDepose = {
  types: yup.array().of(yup.object(eigTypeDepose)).min(1).required(),
};

const eigTypesSchemaCRUD = {
  types: yup.array().of(eigTypeBase).min(1).required(),
  victimesAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(Types[Categorie.VICTIMES].AUTRE);
      },
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  securiteAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(Types[Categorie.SECURITE].AUTRE);
      },
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  santeAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(Types[Categorie.SANTE].AUTRE);
      },
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
  fonctionnementAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(
          Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE,
        );
      },
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
      otherwise: (precision) => precision.nullable().strip(),
    }),
};

const informationsGeneralesSchema = {
  personnel: yup
    .array()
    .of(
      yup.object(
        personneSchema({
          showAdresse: false,
          showAttestation: false,
          showCompetence: true,
          showFonction: false,
          showDateNaissance: true,
          showEmail: false,
          showListeFonction: true,
          showTelephone: true,
        }),
      ),
    )
    .min(1, "Vous devez saisir au moins 1 personnel")
    .required(),
  deroulement: yup.string().min(5, "Ce champ est obligatoire").required(),
  dispositionRemediation: yup
    .string()
    .min(5, "Ce champ est obligatoire")
    .required(),
  dispositionVictimes: yup
    .string()
    .min(5, "Ce champ est obligatoire")
    .required(),
  dispositionInformations: yup
    .string()
    .min(5, "Ce champ est obligatoire")
    .required(),
};

const syntheseSchema = {
  ...selectionSejourSchema,
  ...eigTypesDepose,
  ...informationsGeneralesSchema,
  emailAutresDestinataires: yup
    .array()
    .of(yup.string().email("Format de courriel invalide").nullable()),
  isAtteste: yup
    .boolean()
    .oneOf([true], "Vous devez certifier de ces informations")
    .required(),
};

export {
  selectionSejourSchema,
  eigTypesSchemaCRUD,
  informationsGeneralesSchema,
  syntheseSchema,
};
