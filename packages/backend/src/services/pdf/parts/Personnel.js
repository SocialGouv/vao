const dayjs = require("dayjs");

module.exports = function buildPersonnelEncadrant(personnes) {
  return {
    layout: {
      fillColor: function (rowIndex) {
        return rowIndex === 0 ? "#CCCCCC" : null;
      },
    },
    style: {
      fontSize: 9,
      margin: [0, 5, 0, 0],
    },
    table: {
      body: [
        [
          "Nom",
          "Prénom",
          "Date de naissance",
          "Competence",
          "Fonctions",
          "Téléphone",
        ],
        ...personnes.map((personne) => [
          personne.nom ?? "",
          personne.prenom ?? "",
          personne?.dateNaissance
            ? dayjs(personne?.dateNaissance).format("DD/MM/YYYY")
            : "",
          personne.competence ?? "",
          personne.listeFonction?.join(", "),
          personne.telephone ?? "",
        ]),
      ],
      widths: [80, 80, 60, 90, 90, 60],
    },
  };
};
