const { object, string, array } = require("yup");

const personneSchema = require("./parts/personne");

const schema = () =>
  object({
    ...personneSchema({
      showEmail: true,
      showFonction: false,
    }),
    roles: array().min(1, "Au moins un rôle doit être renseigné").required(),
    territoire: string().required("Le territoire est obligatoire"),
  });

module.exports = schema;
