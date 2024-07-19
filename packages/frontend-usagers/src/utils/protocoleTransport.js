import * as yup from "yup";

const responsableTransportLieuSejourOptions = [
  {
    label: "Les vacanciers viennent par leurs propres moyens",
    id: "vacanciers",
    name: "vacanciers",
  },
  {
    label: "Le transport vers le lieu de séjour est assuré par l'organisateur",
    id: "organisateur",
    name: "organisateur",
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
    required: "Le champ est obligatoire.",
  },
});

const schema = {
  files: yup.array(),
  responsableTransportLieuSejour: yup
    .array()
    .min(1, "vous devez sélectionner au moins une valeur")
    .required(),
  modeTransport: yup.array().when("responsableTransportLieuSejour", {
    is: (val) => val?.includes("organisateur"),
    then: (modeTransport) =>
      modeTransport
        .min(1, "Vous devez sélectionner au moins un des éléments")
        .required(),
    otherwise: (modeTransport) => modeTransport.nullable(),
  }),
  precisionModeOrganisation: yup
    .string()
    .when("responsableTransportLieuSejour", {
      is: (responsableTransportLieuSejour) =>
        responsableTransportLieuSejour?.includes("organisateur"),
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser le mode d'organisation")
          .required(),
      otherwise: (precision) => precision.nullable(),
    }),
  deplacementDurantSejour: yup
    .boolean()
    .required(
      "Il est obligatoire de spécifier si des déplacements sont prévus ou non durant le séjour",
    ),
  vehiculesAdaptes: yup
    .boolean()
    .when(["deplacementDurantSejour", "modeTransport"], {
      is: (deplacement, mode) =>
        deplacement ||
        mode?.includes("Autobus, car") ||
        mode?.includes("Automobile"),
      then: (vehicules) => vehicules.required(),
      otherwise: (vehicules) => vehicules.nullable(),
    }),
  precisionVehiculesAdaptes: yup.string().when("vehiculesAdaptes", {
    is: (val) => val,
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser les spécificités des véhicules")
        .required(),
    otherwise: (precision) => precision.nullable(),
  }),
};

export default {
  responsableTransportLieuSejourOptions,
  transportOptions,
  schema,
};
