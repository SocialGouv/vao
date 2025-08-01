const Personnel = require("./Personnel");
const Prestataire = require("./Prestataire");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function buildInformationsPersonnel(info) {
  return [
    {
      margin: [0, 20, 0, 0],
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
                      text: "Informations sur le personnel présent au cours du séjour",
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
                MiseEnPage.formatLine(
                  "Personnel encadrant présent : :",
                  info.nombreResponsable,
                ),
              ],
            },
          ],
          margin: [0, 0, 0, 10],
        },
        Personnel(info.encadrants),
        {
          columns: [
            {
              alignment: "left",
              columnGap: 10,
              stack: [
                MiseEnPage.formatLine(
                  "Personnel accompagnant présent :",
                  info.nombreAccompagnant,
                ),
              ],
            },
          ],
          margin: [0, 15, 0, 10],
        },
        Personnel(info.accompagnants),
        MiseEnPage.formatLine(
          "Procédure de recrutement supplémentaires durant le séjour :",
          info.procedureRecrutementSupplementaire ? "Oui" : "Non",
          { columnGap: 10 },
        ),
        MiseEnPage.formatLine(
          "Organisation, contenu et durée d’une session de formation en amont de l'arrivée des vacanciers en vue de la coordination des équipes :",
          info.formation,
          { columnGap: 10, marginRight: 10 },
        ),
        ...Prestataire(
          info.prestatairesMedicaments,
          "Prestataires extérieur en charges des médicaments",
        ),
        ...Prestataire(
          info.prestatairesTransport,
          "Prestataires extérieur en charge du transport des vacanciers",
        ),
        ...Prestataire(
          info.prestatairesRestauration,
          "Prestataires extérieur en charge de la restauration",
        ),
        ...Prestataire(
          info.prestatairesEntretien,
          "Prestataires extérieur en charge de l'entretien et du ménage",
        ),
        ...Prestataire(
          info.prestatairesActivites,
          "Prestataires extérieur en charge d'encadrer les activités spécifiques",
        ),
      ],
    },
  ];
};
