const yup = require("yup");
const regex = require("../../utils/regex");
const adresseSchema = require("./adresse");

const schema = ({ showAdresse, showEmail, showTelephone } = {}) => {
  return {
    fonction: yup.string().required(),
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
    ...(showEmail && {
      email: yup
        .string()
        .test("email", "l'email n'est pas au format attendu", (email) =>
          regex.emailRegex.test(email),
        )
        .required(),
    }),
    ...(showAdresse && {
      adresse: yup.object({
        ...adresseSchema(),
      }),
    }),
  };
};

module.exports = schema;
