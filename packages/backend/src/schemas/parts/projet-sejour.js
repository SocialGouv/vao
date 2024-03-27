const yup = require("yup");

yup.setLocale({
  mixed: {
    required: "Le champs est obligatoire.",
  },
});

const schema = {
  activitesCulturelles: yup.array().required(),
  activitesSportives: yup.array().required(),
  destination: yup.array().required(),
};

module.exports = schema;
