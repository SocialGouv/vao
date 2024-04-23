import * as yup from "yup";

const trancheAgeOptions = [
  { label: "18-39 ans", id: "18+", name: "18_39" },
  { label: "40-59 ans", id: "40+", name: "40_59" },
  { label: "Plus de 59 ans", id: "59+", name: "59_et_plus" },
];

const typeDeficiencesOptions = [
  { label: "Auditif", id: "auditif", name: "auditif" },
  { label: "Visuel", id: "visuel", name: "visuel" },
  { label: "Mental/Psychique", id: "mental", name: "mental" },
  { label: "Moteur", id: "moteur", name: "moteur" },
  {
    label: "Polyhandicap",
    id: "polyhandicap",
    name: "polyhandicap",
  },
];

yup.setLocale({
  mixed: {
    required: "Le champ est obligatoire.",
  },
});

const schema = {
  effectifPrevisionnel: yup
    .number()
    .typeError("L'effectif prévisionnel doit être un nombre entier")
    .required(),
  effectifPrevisionnelHomme: yup
    .number()
    .typeError("Le nombre d'hommes doit un être un nombre entier")
    .required(),
  effectifPrevisionnelFemme: yup
    .number()
    .typeError("Le nombre de femmes doit un être un nombre entier")
    .required(),
  trancheAge: yup
    .array()
    .min(1, "vous devez cocher au moins une des tranches d'âge indiquées ")
    .required(),
  typeDeficiences: yup
    .array()
    .min(1, "vous devez cocher au moins une des déficiences listées")
    .required(),
  precisionDeficiences: yup
    .string()
    .required("Vous devez préciser votre réponse précédente"),
};

export default {
  trancheAgeOptions,
  typeDeficiencesOptions,
  schema,
};
