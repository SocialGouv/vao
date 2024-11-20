import * as yup from "yup";

export const adresseSchema = ({ isFromAPIAdresse } = {}) => {
  return isFromAPIAdresse
    ? {
        cleInsee: yup.string().nullable(true),
        codeInsee: yup.string().required("ce champ est obligatoire"),
        codePostal: yup.string().required("ce champ est obligatoire"),
        coordinates: yup.array().required("ce champ est obligatoire"),
        departement: yup.string().required("ce champ est obligatoire"),
        label: yup.string().required("ce champ est obligatoire"),
      }
    : {
        label: yup.string().required(),
      };
};
