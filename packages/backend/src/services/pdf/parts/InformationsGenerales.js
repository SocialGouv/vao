const dayjs = require("dayjs");
const Organisme = require("./Organisme");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function buildInformationsGenerales(declaration, type) {
  const lines = [
    ["Libellé du séjour :", declaration.libelle],
    [
      type === "8jours"
        ? "Date de début du séjour :"
        : "Date indicative de début du séjour :",
      dayjs(declaration.dateDebut).format("DD/MM/YYYY"),
    ],
    [
      type === "8jours"
        ? "Date de fin du séjour :"
        : "Date indicative de fin du séjour :",
      dayjs(declaration.dateFin).format("DD/MM/YYYY"),
    ],
    ["Saison :", declaration.periode],
    ["Durée du séjour :", `${declaration.duree} jours`],
    [
      "Séjour itinérant :",
      declaration.hebergement.sejourItinerant ? "Oui" : "Non",
    ],
  ];

  if (declaration.hebergement.sejourItinerant) {
    lines.push([
      "Séjour à l'étranger :",
      declaration.hebergement.sejourEtranger ? "Oui" : "Non",
    ]);
  }

  lines.push([
    "Liste des départements de séjour :",
    declaration.hebergement.hebergements
      .map((h) => h.coordonnees.adresse.departement)
      .join(", "),
  ]);

  return {
    stack: [
      {
        margin: MiseEnPage.MARGIN_UP_30,
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
              ...MiseEnPage.buildLines(lines, { marginUp: 0 }),
              Organisme(declaration.responsableSejour, declaration?.organisme),
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
};
