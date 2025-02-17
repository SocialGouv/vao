const statuts = {
  ACTIF: "actif",
  BROUILLON: "brouillon",
  DESACTIVE: "desactive",
};

const statutsValues = [
  {
    value: "",
    text: "Tous",
  },
  {
    value: statuts.BROUILLON,
    text: "Brouillon",
  },
  {
    value: statuts.ACTIF,
    text: "Actif",
  },
  {
    value: statuts.DESACTIVE,
    text: "Désactivé",
  },
];

export default {
  statuts,
  statutsValues,
};
