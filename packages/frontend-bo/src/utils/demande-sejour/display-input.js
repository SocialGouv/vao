export const InputTypes = {
  TEXT: "text",
  RADIO: "radio",
  SELECT: "select",
  MULTISELECT: "multiselect",
};

export const Iorganisateur = {
  nom: {
    type: InputTypes.TEXT,
    label: "Nom",
  },
  prenom: {
    type: InputTypes.TEXT,
    label: "Prénom",
  },
  fonction: {
    type: InputTypes.TEXT,
    label: "Fonction",
  },
  telephone: {
    type: InputTypes.TEXT,
    label: "Téléphone",
  },
  email: {
    type: InputTypes.TEXT,
    label: "Email",
  },
  adresse: {
    type: InputTypes.TEXT,
    label: "Adresse",
  },
};
