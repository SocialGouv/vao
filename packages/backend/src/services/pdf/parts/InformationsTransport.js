const Transport = require("./Transport.js");
const TransportHebergement = require("./TransportHebergement.js");

module.exports = function buildInformationsTransport(info, hebergement) {
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
                    text: "Informations sur le transport",
                    width: "300",
                  },
                ],
              },
            ],
          ],
          headerRows: 1,
          layout: "noBorders",

          margin: [0, 20, 0, 0],
          widths: ["*"],
        },
      },
      ...Transport(info),
      ...TransportHebergement(hebergement),
      {
        columnGap: 10,
        columns: [
          {
            alignment: "left",
            columnGap: 10,
            margin: [0, 20, 0, 0],
            stack: [
              {
                columns: [
                  {
                    text: "Fichiers téléversés :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.files.map((f) => f.name).join(", ")}`,
                    width: "*",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};
