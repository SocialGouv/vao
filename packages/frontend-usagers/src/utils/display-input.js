import dayjs from "dayjs";

const InputTypes = {
  RAW: "raw",
  TEXT: "text",
  RADIO: "radio",
  SELECT: "select",
  MULTISELECT: "multiselect",
  NUMBER: "number",
  TO_FORMAT: "to_format",
  TABLE: "table",
};

const IUser = {
  email: {
    inputType: InputTypes.TEXT,
    label: "Adresse courriel",
  },
  nom: {
    inputType: InputTypes.TEXT,
    label: "Nom",
  },
  prenom: {
    inputType: InputTypes.TEXT,
    label: "Prénom",
  },
  createdAt: {
    inputType: InputTypes.TO_FORMAT,
    label: "Date de création du compte",
    formatter: (value) => dayjs(value).format("DD/MM/YYYY"),
  },
  telephone: {
    inputType: InputTypes.TEXT,
    label: "Numéro de téléphone",
  },
  lastConnectionAt: {
    inputType: InputTypes.TO_FORMAT,
    label: "Date de dernière connexion",
    formatter: (value) => dayjs(value).format("DD/MM/YYYY"),
  },
  statut: {
    inputType: InputTypes.TO_FORMAT,
    label: "Statut",
    formatter: (value) => value,
  },
  organisme: {
    inputType: InputTypes.TEXT,
    label: "Organisme",
    formatter: (value) => value,
  },
};

export default {
  InputTypes,
  IUser,
};
