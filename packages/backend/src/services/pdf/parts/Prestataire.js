const dayjs = require("dayjs");

module.exports = function buildPrestataire(personnes, label) {
  if (personnes.length > 0) {
    return [
      {
        columns: [
          {
            alignment: "left",
            columnGap: 10,
            stack: [
              {
                columns: [
                  {
                    text: `${label} :`,
                    width: 250,
                  },
                ],
              },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        layout: {
          fillColor: function (rowIndex) {
            return rowIndex === 0 ? "#CCCCCC" : null;
          },
        },
        style: {
          margin: [0, 5, 0, 10],
        },
        table: {
          body: [
            [
              "Nom / Raison commerciale",
              "Prénom / Nom commercial",
              "Téléphone",
              "Adresse",
              "Date de naissance",
              "Compétences",
            ],
            ...personnes.map((personne) => [
              personne.nom,
              personne.prenom,
              personne.telephone,
              personne?.adresse?.label ?? "",
              personne?.dateNaissance
                ? dayjs(personne?.dateNaissance).format("DD/MM/YYYY")
                : "",
              personne?.competence ?? "",
            ]),
          ],
          widths: [80, 80, 70, 80, 80, 70],
        },
      },
    ];
  } else return [];
};
