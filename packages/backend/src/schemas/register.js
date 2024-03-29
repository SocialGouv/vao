const { object } = require("yup");

const passwordSchema = require("./parts/password");
const personneSchema = require("./parts/personne");

const schema = () =>
  object({
    ...personneSchema({
      showEmail: true,
      showFonction: false,
      showTelephone: true,
    }),
    password: passwordSchema(),
  });

module.exports = schema;
