const yup = require("yup");
const { UpdateTypes, Types, Categorie } = require("../helpers/eig");
const personne = require("./parts/personne.js");

const selectionSejourSchema = {
  demandeSejourId: yup
    .number()
    .integer("Ce champ doit contenir un nombre entier")
    .required(),
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
  types: yup
    .array()
    .of(
      yup
        .string()
        .oneOf(
          [
            ...Object.values(Types[Categorie.VICTIMES]),
            ...Object.values(Types[Categorie.SECURITE]),
            ...Object.values(Types[Categorie.SANTE]),
            ...Object.values(Types[Categorie.FONCTIONNEMENT_ORGANISME]),
          ],
          "la valeur insérée ne fait pas partie de la liste des possibles",
        ),
    )
    .min(1)
    .required(),
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
          showAttestation: true,
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

module.exports.selectionSejourSchema = selectionSejourSchema;
module.exports.eigTypesSchema = eigTypesSchemaCRUD;
module.exports.informationsGeneralesSchema = informationsGeneralesSchema;

module.exports.updateSchemaAdapteur = (type) => {
  switch (type) {
    case UpdateTypes.DECLARATION_SEJOUR:
      return selectionSejourSchema;
    case UpdateTypes.TYPE_EVENEMENT:
      return eigTypesSchemaCRUD;
    case UpdateTypes.RENSEIGNEMENT_GENERAUX:
      return informationsGeneralesSchema;
    default:
      throw new Error("Le type demandé n'existe pas");
  }
};
