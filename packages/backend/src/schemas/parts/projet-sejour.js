const yup = require("yup");

yup.setLocale({
  mixed: {
    required: "Le champ est obligatoire.",
  },
});

const schema = () => ({
  activitesBienEtre: yup
    .array()
    .required()
    .default(() => []),
  activitesCulturelles: yup
    .array()
    .required()
    .default(() => []),
  activitesPersonnelPrevu: yup.string().nullable(),
  activitesSportives: yup
    .array()
    .required()
    .default(() => []),
  destination: yup
    .array()
    .required()
    .default(() => []),
});

module.exports = schema;
