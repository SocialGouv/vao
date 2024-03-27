const yup = require("yup");

const schema = {
  deplacementDurantSejour: yup
    .string()
    .required("Le remplissage de ce champ est obligatoire"),
  files: yup.array(),
  modeTransport: yup
    .array()
    .min(1, "vous devez sélectionner au moins un mode de transport"),
  precisionModeOrganisation: yup
    .string()
    .required()
    .min(5, "Les précisions sur le mode d'organisation sont obligatoires'"),
  responsableTransportLieuSejour: yup.string().required(),
};

module.exports = schema;
