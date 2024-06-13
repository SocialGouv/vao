const Sanitaire = require("./Sanitaire");

module.exports = function buildInformationsSanitaire(info) {
  return {
    stack: [
      {
        margin: [0, 30, 0, 20],
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
                    text: "Informations sanitaires",
                    width: "300",
                  },
                ],
              },
            ],
          ],
          headerRows: 1,
          layout: "noBorders",
          widths: ["*"],
        },
      },
      ...Sanitaire(info),
      {
        columns: [
          {
            alignment: "left",
            columnGap: 10,
            stack: [
              {
                columns: [
                  {
                    text: "Fichiers téléversés :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.files.length > 0 ? info.files.map((f) => f.name).join(", ") : "Aucun"}`,
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
