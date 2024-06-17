const dayjs = require("dayjs");
const Organisme = require("./Organisme");

module.exports = function buildInformationsGenerales(declaration) {
  return {
    stack: [
      {
        margin: [0, 30, 0, 0],
        table: {
          body: [
            [
              {
                alignment: "left",
                fillColor: "#000091",
                stack: [
                  {
                    bold: true,
                    color: "#F5F5FE",
                    fontSize: 10,
                    text: "Informations générales",
                    width: "300",
                  },
                ],
              },
            ],
          ],
          headerRows: 1,
          layout: ["headerLineOnly", "noBorders"],
          widths: ["*"],
        },
      },
      {
        columns: [
          {
            alignment: "left",
            columnGap: 10,
            stack: [
              {
                columns: [
                  {
                    text: "Libellé du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.libelle}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Date indicative de début du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${dayjs(declaration.dateDebut).format("DD/MM/YYYY")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Date indicative de fin du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${dayjs(declaration.dateFin).format("DD/MM/YYYY")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Saison :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.periode}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Durée du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.duree} jours`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Séjour itinérant :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.hebergement.sejourItinerant ? "Oui" : "Non"}`,
                    width: "*",
                  },
                ],
              },
              ...(declaration.hebergement.sejourItinerant
                ? [
                    {
                      columns: [
                        {
                          text: "Séjour à l'étranger :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${declaration.hebergement.sejourEtranger ? "Oui" : "Non"}`,
                          width: "*",
                        },
                      ],
                    },
                  ]
                : []),
              {
                columns: [
                  {
                    text: "Liste des départements de séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.hebergement.hebergements.map((h) => h.coordonnees.adresse.departement).join(", ")}`,
                    width: "*",
                  },
                ],
              },
              Organisme(declaration.responsableSejour, declaration?.organisme),
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
};
