import * as yup from "yup";

const schema = ({ isFromAPIAdresse } = {}) => {
  return isFromAPIAdresse
    ? {
        label: yup.string().required("ce champ est obligatoire"),
        codeInsee: yup.string().required("ce champ est obligatoire"),
        codePostal: yup.string().required("ce champ est obligatoire"),
        coordinates: yup.array().required("ce champ est obligatoire"),
        departement: yup.string().required("ce champ est obligatoire"),
      }
    : {
        label: yup.string().required(),
      };
};

export default {
  schema,
};
