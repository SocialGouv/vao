const dayjs = require("dayjs");
const Regions = require("../../geo/Region");

module.exports = async function buildAgrement(agrement) {
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
          {
            columns: [
              {
                text: "Numéro d'agrément :",
                width: 250,
              },
              {
                bold: true,
                text: `${agrement.numero}`,
                width: "*",
              },
            ],
          },
          {
            columns: [
              {
                text: "Date d'obtention de l'agrément :",
                width: 250,
              },
              {
                bold: true,
                text: `${dayjs(agrement.dateObtention).format("DD/MM/YYYY")}`,
                width: "*",
              },
            ],
          },
          {
            columns: [
              {
                text: "Région d'obtention de l'agrément :",
                width: 250,
              },
              {
                bold: true,
                text: await Regions.fetchOne(agrement.regionObtention),
                width: "*",
              },
            ],
          },
          {
            columns: [
              {
                text: "Nom du fichier téléversé :",
                width: 250,
              },
              {
                bold: true,
                text: `${agrement.file.name}`,
                width: "*",
              },
            ],
          },
        ],
      },
    ],
  };
};
