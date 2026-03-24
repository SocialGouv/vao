import * as yup from "yup";

export const adresseSchema = ({
  isFromAPIAdresse,
}: { isFromAPIAdresse?: boolean } = {}): Record<string, yup.AnySchema> => {
  return isFromAPIAdresse
    ? {
        cleInsee: yup.string().nullable(),
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
