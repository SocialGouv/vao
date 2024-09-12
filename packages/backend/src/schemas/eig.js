const yup = require("yup");
const { UpdateTypes, Types, Categorie } = require("../helpers/eig");
const personne = require("./parts/personne.js");

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
      otherwise: (precision) => precision.nullable().strip(),
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
    }),
  type: eigTypeBase,
};

const eigTypesDepose = {
  types: yup.array().of(yup.object(eigTypeDepose)).min(1).required(),
};

const eigTypesSchemaCRUD = {
  fonctionnementAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(
          Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE,
        );
      },
      otherwise: (precision) => precision.nullable().strip(),
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
    }),
  santeAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(Types[Categorie.SANTE].AUTRE);
      },
      otherwise: (precision) => precision.nullable().strip(),
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
    }),
  securiteAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(Types[Categorie.SECURITE].AUTRE);
      },
      otherwise: (precision) => precision.nullable().strip(),
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
    }),
  types: yup.array().of(eigTypeBase).min(1).required(),
  victimesAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(Types[Categorie.VICTIMES].AUTRE);
      },
      otherwise: (precision) => precision.nullable().strip(),
      then: (precision) =>
        precision.min(5, "Ce champ est obligatoire").required(),
    }),
};

const informationsGeneralesSchema = {
  deroulement: yup.string().min(5, "Ce champ est obligatoire").required(),
  dispositionInformations: yup
    .string()
    .min(5, "Ce champ est obligatoire")
    .required(),
  dispositionRemediation: yup
    .string()
    .min(5, "Ce champ est obligatoire")
    .required(),
  dispositionVictimes: yup
    .string()
    .min(5, "Ce champ est obligatoire")
    .required(),
  personnel: yup
    .array()
    .of(
      yup.object(
        personne({
          showAdresse: false,
          showAttestation: false,
          showCompetence: true,
          showDateNaissance: true,
          showEmail: false,
          showFonction: false,
          showListeFonction: true,
          showTelephone: true,
        }),
      ),
    )
    .min(1, "Vous devez saisir au moins 1 personnel")
    .required(),
};

const emailAutresDestinatairesSchema = {
  emailAutresDestinataires: yup
    .array()
    .of(yup.string().email("Format de courriel invalide").nullable()),
};

const syntheseSchema = {
  ...selectionSejourSchema,
  ...eigTypesDepose,
  ...informationsGeneralesSchema,
  ...emailAutresDestinatairesSchema,
};

module.exports.selectionSejourSchema = selectionSejourSchema;
module.exports.eigTypesSchema = eigTypesSchemaCRUD;
module.exports.informationsGeneralesSchema = informationsGeneralesSchema;
module.exports.syntheseSchema = syntheseSchema;

module.exports.updateSchemaAdapteur = (type) => {
  switch (type) {
    case UpdateTypes.DECLARATION_SEJOUR:
      return selectionSejourSchema;
    case UpdateTypes.TYPE_EVENEMENT:
      return eigTypesSchemaCRUD;
    case UpdateTypes.RENSEIGNEMENT_GENERAUX:
      return informationsGeneralesSchema;
    case UpdateTypes.EMAIL_AUTRES_DESTINATAIRES:
      return emailAutresDestinatairesSchema;
    default:
      throw new Error("Le type demandé n'existe pas");
  }
};
