const {
  trancheAges,
  typeDeficiences,
} = require("../../../../helpers/declaration/informations-vacanciers");

module.exports = function buildInformationsVacanciers(info) {
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
                    text: "Informations prévisionnelles sur les vacanciers",
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
                    text: "Effectif prévisionnel des vacanciers :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.effectifPrevisionnel}`,
                    width: 40,
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Répartition Femmes / Hommes :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.effectifPrevisionnelFemme} / ${info.effectifPrevisionnelHomme}`,
                    width: 40,
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Tranches d'âge :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.trancheAge.map((t) => trancheAges[t] ?? t).join(", ")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Type de déficience :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.typeDeficiences.map((t) => typeDeficiences[t] ?? t).join(", ")}`,
                    width: "*",
                  },
                ],
              },
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
};
