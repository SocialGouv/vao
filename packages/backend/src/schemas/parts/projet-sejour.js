const yup = require("yup");

yup.setLocale({
  mixed: {
    required: "Le champs est obligatoire.",
  },
});

const schema = () => ({
  activitesBienEtre: yup.array().required(),
  activitesCulturelles: yup.array().required(),
  activitesPersonnelPrevu: yup.string().nullable(),
  activitesSportives: yup.array().required(),
  destination: yup.array().required(),
});

module.exports = schema;
