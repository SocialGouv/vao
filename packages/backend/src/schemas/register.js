const { object } = require("yup");

const passwordSchema = require("./parts/password");
const personneSchema = require("./parts/personne");

const schema = () =>
  object({
    ...personneSchema({
      showAdresse: false,
      showAttestation: false,
      showCompetence: false,
      showDateNaissance: false,
      showEmail: true,
      showFonction: false,
      showListeFonction: false,
      showTelephone: true,
    }),
    password: passwordSchema(),
  });

module.exports = schema;
