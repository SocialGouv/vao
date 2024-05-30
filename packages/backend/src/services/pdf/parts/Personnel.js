const dayjs = require("dayjs");

module.exports = function buildPersonnelEncadrant(personnes) {
  return {
    layout: {
      fillColor: function (rowIndex) {
        return rowIndex === 0 ? "#CCCCCC" : null;
      },
    },
    style: {
      margin: [0, 5, 0, 0],
    },
    table: {
      body: [
        ["Nom", "Prénom", "Date de naissance", "Téléphone", "Fonctions"],
        ...personnes.map((personne) => [
          personne.nom,
          personne.prenom,
          personne?.dateNaissance
            ? dayjs(personne?.dateNaissance).format("DD/MM/YYYY")
            : "",
          personne.telephone,
          personne.listeFonction?.join(", "),
        ]),
      ],
      widths: [80, 80, 80, 80, 150],
    },
  };
};
