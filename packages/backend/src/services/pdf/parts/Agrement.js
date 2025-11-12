const dayjs = require("dayjs");
const Regions = require("../../geo/Region");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = async function buildAgrement(agrement) {
  let region = "";
  try {
    const result = await Regions.fetchOne(agrement.regionObtention);
    if (result && result.text) {
      region = result.text;
    }
  } catch (e) {
    console.error("Erreur lors de la récupération de la région :", e);
  }

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
                    text: "Arrêté portant décision de l'agrément",
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
        columnGap: 10,
        margin: [0, 20, 0, 0],
        stack: [
          MiseEnPage.buildLines(
            [
              ["Numéro d'agrément :", agrement.numero],
              [
                "Date d'obtention de l'agrément :",
                dayjs(agrement.dateObtention).format("DD/MM/YYYY"),
              ],
              ["Région d'obtention de l'agrément :", region],
              ["Nom du fichier téléversé :", agrement.file.name],
            ],
            { marginUp: 0 },
          ),
        ],
      },
    ],
  };
};
