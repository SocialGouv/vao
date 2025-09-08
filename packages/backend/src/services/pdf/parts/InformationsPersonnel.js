const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function buildInformationsPersonnel(info) {
  const lines = [
    ["Nombre de personnes responsables présentes :", info.nombreResponsable],
    ["Nombre d'accompagnants présents :", info.nombreAccompagnant],
    [
      "Procédure de recrutement supplémentaires durant le séjour :",
      info.procedureRecrutementSupplementaire ? "Oui" : "Non",
    ],
  ];

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
                    text: "Informations indicatives sur le personnel présent au cours du séjour",
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
            stack: MiseEnPage.buildLines(lines),
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
};
