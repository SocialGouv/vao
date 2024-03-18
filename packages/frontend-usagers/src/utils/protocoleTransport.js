import * as yup from "yup";

const responsableTransportLieuSejourOptions = [
  {
    label: "Les vacanciers viennent par leurs propres moyens",
    value: "vacanciers",
  },
  {
    label: "Le transport vers le lieu de séjour est assuré par l'organisateur",
    value: "organisateur",
  },
];

const transportOptions = [
  { text: "Avion", value: "Avion", id: "1" },
  { text: "Train", value: "Train", id: "2" },
  {
    text: "Autobus, car",
    value: "Autobus, car",
    id: "3",
  },
  { text: "Automobile", value: "Automobile", id: "4" },
  { text: "Bateau", value: "Bateau", id: "5" },
  { text: "Autre", value: "Autre", id: "6" },
];

yup.setLocale({
  mixed: {
    required: "Le champs est obligatoire.",
  },
});

const schema = {
  files: yup.array(),
  responsableTransportLieuSejour: yup.string().required(),
  deplacementDurantSejour: yup
    .string()
    .required("Le remplissage de ce champ est obligatoire"),
  precisionModeOrganisation: yup
    .string()
    .required()
    .min(5, "Les précisions sur le mode d'organisation sont obligatoires'"),
  modeTransport: yup
    .array()
    .min(1, "vous devez sélectionner au moins un mode de transport"),
};

export default {
  responsableTransportLieuSejourOptions,
  transportOptions,
  schema,
};
