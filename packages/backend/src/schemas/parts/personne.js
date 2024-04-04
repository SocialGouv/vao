const yup = require("yup");

const adresseSchema = require("./adresse");
const emailSchema = require("./email");
const nomSchema = require("./nom");
const prenomSchema = require("./prenom");
const telephoneSchema = require("./telephone");

const schema = (
  { showAdresse, showEmail, showTelephone, showFonction = true } = {
    showFonction: true,
  },
) => {
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
    ...(showFonction && {
      fonction: yup.string().required(),
    }),
  };
};

module.exports = schema;
