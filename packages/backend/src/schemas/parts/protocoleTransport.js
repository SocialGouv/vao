const yup = require("yup");

const schema = () => ({
  deplacementDurantSejour: yup
    .boolean()
    .required("Le remplissage de ce champ est obligatoire"),
  files: yup.array(),
  modeTransport: yup.array().when("responsableTransportLieuSejour", {
    is: (val) => val?.includes("organisateur"),
    otherwise: (modeTransport) => modeTransport.nullable().strip(),
    then: (modeTransport) =>
      modeTransport
        .min(1, "Vous devez sélectionner au moins un des éléments")
        .required(),
  }),
  precisionModeOrganisation: yup
    .string()
    .when("responsableTransportLieuSejour", {
      is: (responsableTransportLieuSejour) =>
        responsableTransportLieuSejour?.includes("organisateur"),
      otherwise: (precision) => precision.nullable().strip(),
      then: (precision) =>
        precision
          .min(5, "Vous devez préciser le mode d'organisation")
          .required(),
    }),
  precisionVehiculesAdaptes: yup.string().when("vehiculesAdaptes", {
    is: (val) => val,
    otherwise: (precision) => precision.nullable().strip(),
    then: (precision) =>
      precision
        .min(5, "Vous devez préciser les spécificités des véhicules")
        .required(),
  }),
  responsableTransportLieuSejour: yup
    .array()
    .min(1, "Au moins une des deux options doit être sélectionnée")
    .required(),
  vehiculesAdaptes: yup
    .boolean()
    .when(["deplacementDurantSejour", "modeTransport"], {
      is: (deplacement, mode) =>
        deplacement ||
        mode?.includes("Autobus, car") ||
        mode?.includes("Automobile"),
      otherwise: (vehicules) => vehicules.nullable().strip(),
      then: (vehicules) => vehicules.required(),
    }),
});

module.exports = schema;
