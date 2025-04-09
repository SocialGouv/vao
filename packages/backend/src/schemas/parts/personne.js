const yup = require("yup");
const dayjs = require("dayjs");

const adresseSchema = require("./adresse");
const emailSchema = require("./email");
const nomSchema = require("./nom");
const prenomSchema = require("./prenom");
const telephoneSchema = require("./telephone");
const {
  fonctionOptions,
} = require("../../helpers/declaration/informations-personnel");

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
    nom: nomSchema(),
    prenom: prenomSchema(),
    ...(showTelephone && {
      telephone: telephoneSchema(),
    }),
    ...(showEmail && {
      email: emailSchema(),
    }),
    ...(showAdresse && {
      adresse: yup.object(adresseSchema()),
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
            fonctionOptions.map((o) => o.value),
            "la valeur insérée ne fait pas partie de la liste des possibles",
          ),
        )
        .required(),
    }),
  };
};

module.exports = schema;
