const yup = require("yup");

yup.setLocale({
  mixed: {
    required: "Le champ est obligatoire.",
  },
});

const schema = () => ({
  effectifPrevisionnel: yup
    .number()
    .typeError("L'effectif prévisionnel doit être un nombre entier")
    .required(),
  effectifPrevisionnelFemme: yup
    .number()
    .typeError("Le nombre de femmes doit un être un nombre entier")
    .required(),
  effectifPrevisionnelHomme: yup
    .number()
    .typeError("Le nombre d'hommes doit un être un nombre entier")
    .required(),
  precisionDeficiences: yup
    .string()
    .required("Vous devez préciser votre réponse précédente"),
  trancheAge: yup
    .array()
    .min(1, "vous devez cocher au moins une case")
    .required(),
  typeDeficiences: yup
    .array()
    .min(1, "vous devez cocher au moins une case")
    .required(),
});

module.exports = schema;
