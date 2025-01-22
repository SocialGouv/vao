const statutsValues = [
  {
    value: "",
    text: "Tous",
    label: "",
  },
  {
    value: 1,
    text: "Brouillon",
    label: "brouillon",
  },
  {
    value: 2,
    text: "Actif",
    label: "actif",
  },
  {
    value: 3,
    text: "Désactivé",
    label: "desactive",
  },
];

const statuts = {
  ACTIF: "actif",
  BROUILLON: "brouillon",
  DESACTIVE: "desactive",
};

export default {
  statuts,
  statutsValues,
};
