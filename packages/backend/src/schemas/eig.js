const yup = require("yup");
const {
  UpdateTypes,
  Types,
  Categorie,
  isTypeActive,
} = require("../helpers/eig");
const personne = require("./parts/personne.js");

const selectionSejourSchema = (dateDebut, dateFin) => ({
  date: yup
    .date()
    .typeError("La date n'est pas au format attendu")
    .min(
      dateDebut,
      "La date de l'incident doit être supérieure à la date de début de séjour",
    )
    .max(
      dateFin,
      "La date de l'incident doit être inférieure à la date de fin de séjour",
    )
    .required("Ce champ est obligatoire"),
  declarationId: yup
    .number()
    .integer("Ce champ doit contenir un nombre entier")
    .required("Ce champ est obligatoire"),
  departement: yup.string().required("Ce champ est obligatoire"),
});

const eigTypeBase = yup
  .string()
  .oneOf(
    [
      ...Object.values(Types[Categorie.VICTIMES]).filter((type) =>
        isTypeActive(type),
      ),
      ...Object.values(Types[Categorie.SECURITE]).filter((type) =>
        isTypeActive(type),
      ),
      ...Object.values(Types[Categorie.SANTE]).filter((type) =>
        isTypeActive(type),
      ),
      ...Object.values(Types[Categorie.FONCTIONNEMENT_ORGANISME]).filter(
        (type) => isTypeActive(type),
      ),
    ],
    "La valeur insérée ne fait pas partie de la liste des possibles",
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
        precision
          .required("Ce champ est obligatoire")
          .min(5, "Ce champ doit faire au moins 5 caractères"),
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
        precision
          .required("Ce champ est obligatoire")
          .min(5, "Ce champ doit faire au moins 5 caractères"),
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
        precision
          .required("Ce champ est obligatoire")
          .min(5, "Ce champ doit faire au moins 5 caractères"),
    }),
  types: yup
    .array()
    .of(eigTypeBase)
    .min(1)
    .required("Ce champ est obligatoire"),
  victimesAutrePrecision: yup
    .string()
    .nullable()
    .when("types", {
      is: (types) => {
        return (types ?? []).includes(Types[Categorie.VICTIMES].AUTRE);
      },
      otherwise: (precision) => precision.nullable().strip(),
      then: (precision) =>
        precision
          .required("Ce champ est obligatoire")
          .min(5, "Ce champ doit faire au moins 5 caractères"),
    }),
};

const informationsGeneralesSchema = {
  deroulement: yup
    .string()
    .min(5, "Ce champ doit faire au moins 5 caractères")
    .required("Ce champ est obligatoire"),
  dispositionInformations: yup
    .string()
    .min(5, "Ce champ doit faire au moins 5 caractères")
    .required("Ce champ est obligatoire"),
  dispositionRemediation: yup
    .string()
    .min(5, "Ce champ doit faire au moins 5 caractères")
    .required("Ce champ est obligatoire"),
  dispositionVictimes: yup
    .string()
    .min(5, "Ce champ doit faire au moins 5 caractères")
    .required("Ce champ est obligatoire"),
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
    .required("Ce champ est obligatoire"),
};

const emailAutresDestinatairesSchema = {
  emailAutresDestinataires: yup
    .array()
    .of(yup.string().email("Format de courriel invalide").nullable()),
};

const syntheseSchema = (dateDebut, dateFin) => ({
  ...selectionSejourSchema(dateDebut, dateFin),
  ...eigTypesDepose,
  ...informationsGeneralesSchema,
  ...emailAutresDestinatairesSchema,
});

module.exports.selectionSejourSchema = selectionSejourSchema;
module.exports.eigTypesSchema = eigTypesSchemaCRUD;
module.exports.informationsGeneralesSchema = informationsGeneralesSchema;
module.exports.syntheseSchema = syntheseSchema;
module.exports.emailAutresDestinatairesSchema = emailAutresDestinatairesSchema;

module.exports.updateSchemaAdapteur = (type, dateRange) => {
  switch (type) {
    case UpdateTypes.DECLARATION_SEJOUR:
      return selectionSejourSchema(dateRange[0], dateRange[1]);
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
