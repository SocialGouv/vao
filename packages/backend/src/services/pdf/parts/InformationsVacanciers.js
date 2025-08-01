const {
  trancheAges,
  typeDeficiences,
} = require("../../../helpers/declaration/informations-vacanciers");

const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function buildInformationsVacanciers(info, type) {
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
                    text: `${type === "8jours" ? "Informations sur les vacanciers" : "Informations prévisionnelles sur les vacanciers"}`,
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
                type === "8jours"
                  ? "Effectif des vacanciers :"
                  : "Effectif prévisionnel des vacanciers :",
                `${info.effectifPrevisionnel}`,
                { widthValue: 40 },
              ),
              MiseEnPage.formatLine(
                "Répartition Femmes / Hommes :",
                `${info.effectifPrevisionnelFemme} / ${info.effectifPrevisionnelHomme}`,
                { widthValue: 40 },
              ),
              MiseEnPage.formatLine(
                "Tranches d'âge :",
                info.trancheAge.map((t) => trancheAges[t] ?? t).join(", "),
              ),
              MiseEnPage.formatLine(
                "Type de déficience :",
                info.typeDeficiences
                  .map((t) => typeDeficiences[t] ?? t)
                  .join(", "),
              ),
              MiseEnPage.formatLine("Précision :", info.precisionDeficiences, {
                columnGap: 10,
              }),
            ],
          },
        ],
        margin: MiseEnPage.MARGIN_UP_20,
      },
    ],
  };
};
