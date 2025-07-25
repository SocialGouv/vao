import * as yup from "yup";

const sportOptions = [
  { text: "Baignade", value: "Baignade", id: "1" },
  { text: "Randonnée", value: "Randonnée", id: "2" },
  {
    text: "Voile, char à voile, rafting",
    value: "Voile, char à voile, rafting",
    id: "3",
  },
  { text: "Tir à l'arc", value: "Tir à l'arc", id: "4" },
  { text: "ULM", value: "ULM", id: "5" },
  { text: "Equitation", value: "Equitation", id: "6" },
  { text: "Ski", value: "Ski", id: "7" },
  { text: "Sports nautiques", value: "Sports nautiques", id: "8" },
  { text: "Pêche", value: "Pêche", id: "9" },
  { text: "Autres", value: "Autres", id: "10" },
];

const cultureOptions = [
  {
    text: "Visites touristiques, géographiques",
    value: "Visites touristiques, géographiques",
    id: "1",
  },
  {
    text: "Spectacles, animations, musées",
    value: "Spectacles, animations, musées",
    id: "2",
  },
  { text: "Musique", value: "Musique", id: "3" },
  { text: "Expression théâtrale", value: "Expression théâtrale", id: "4" },
  { text: "Arts plastiques", value: "Arts plastiques", id: "5" },
  { text: "Danse", value: "Danse", id: "6" },
  { text: "Chant", value: "Chant", id: "7" },
  { text: "Soirées dansantes", value: "Soirées dansantes", id: "8" },
  { text: "Ferme pédagogique", value: "Ferme pédagogique", id: "9" },
  { text: "Autres", value: "Autres", id: "10" },
];

const bienEtreOption = [
  {
    text: "Thalassothérapie",
    value: "Thalassothérapie",
    id: "1",
  },
  {
    text: "Balnothérapie",
    value: "Balnothérapie",
    id: "2",
  },
  {
    text: "Autre",
    value: "Autre",
    id: "3",
  },
];

const destinationOptions = [
  { label: "Mer", id: "mer", name: "mer", value: "mer" },
  { label: "Montagne", id: "montagne", name: "montagne", value: "montagne" },
  { label: "Campagne", id: "campagne", name: "campagne", value: "campagne" },
  {
    label: "Séjour à thème",
    id: "sejour_a_theme",
    name: "sejour_a_theme",
    value: "sejour_a_theme",
  },
  { label: "Etranger", id: "etranger", name: "etranger", value: "etranger" },
];

yup.setLocale({
  mixed: {
    required: "Le champ est obligatoire.",
  },
});

const schema = {
  destination: yup
    .array()
    .min(1, "Au moins une destination est requise")
    .required("Le champ est obligatoire.")
    .default(() => []),
  activitesCulturelles: yup
    .array()
    .required()
    .default(() => []),
  activitesSportives: yup
    .array()
    .required()
    .default(() => []),
  activitesBienEtre: yup
    .array()
    .required()
    .default(() => []),
  activitesPersonnelPrevu: yup.string().nullable(),
};

export default {
  destinationOptions,
  cultureOptions,
  sportOptions,
  schema,
  bienEtreOption,
};
