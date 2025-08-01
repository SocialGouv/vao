const dayjs = require("dayjs");
const Organisme = require("./Organisme");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function buildInformationsGenerales(declaration, type) {
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
              MiseEnPage.formatLine("Libellé du séjour :", declaration.libelle),
              MiseEnPage.formatLine(
                type === "8jours"
                  ? "Date de début du séjour :"
                  : "Date indicative de début du séjour :",
                dayjs(declaration.dateDebut).format("DD/MM/YYYY"),
              ),
              MiseEnPage.formatLine(
                type === "8jours"
                  ? "Date de fin du séjour :"
                  : "Date indicative de fin du séjour :",
                dayjs(declaration.dateFin).format("DD/MM/YYYY"),
              ),
              MiseEnPage.formatLine("Saison :", declaration.periode),
              MiseEnPage.formatLine(
                "Durée du séjour :",
                `${declaration.duree} jours`,
              ),
              MiseEnPage.formatLine(
                "Séjour itinérant :",
                declaration.hebergement.sejourItinerant ? "Oui" : "Non",
              ),
              ...(declaration.hebergement.sejourItinerant
                ? MiseEnPage.formatLine(
                    "Séjour à l'étranger :",
                    declaration.hebergement.sejourEtranger ? "Oui" : "Non",
                  )
                : []),
              MiseEnPage.formatLine(
                "Liste des départements de séjour :",
                declaration.hebergement.hebergements
                  .map((h) => h.coordonnees.adresse.departement)
                  .join(", "),
              ),
              Organisme(declaration.responsableSejour, declaration?.organisme),
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
};
