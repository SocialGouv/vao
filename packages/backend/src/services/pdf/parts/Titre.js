const dayjs = require("dayjs");

module.exports = function buildTitre(declaration, departementSuivi) {
  return {
    stack: [
      {
        alignment: "center",
        margin: [0, 30, 0, 0],
        table: {
          body: [
            [
              {
                stack: [
                  {
                    bold: true,
                    fontSize: 12,
                    text: "DECLARATION PREALABLE D'UN SEJOUR « VACANCES ADAPTEES ORGANISEES » destiné à des personnes handicapées",
                  },
                  {
                    italics: true,
                    text: "Article R412-14 du code du tourisme",
                  },
                ],
              },
            ],
          ],
          headerRows: 1,
          layout: "headerLineOnly",
          widths: ["*"],
        },
      },
      {
        columnGap: 10,
        columns: [
          {
            alignment: "left",
            stack: [
              {
                columns: [
                  {
                    decoration: "underline",
                    text: "Département instructeur :",
                    width: 150,
                  },
                  {
                    bold: true,
                    text: `DDETS ${departementSuivi}`,
                    width: 150,
                  },
                ],
              },
              {
                columns: [
                  {
                    decoration: "underline",
                    text: "Numéro d'enregistrement :",
                    width: 150,
                  },
                  {
                    bold: true,
                    text: `${declaration.idFonctionnelle}`,
                    width: 150,
                  },
                ],
              },
              {
                columns: [
                  {
                    decoration: "underline",
                    text: "Date de dépôt :",
                    width: 150,
                  },
                  {
                    bold: true,
                    text: `${dayjs(declaration.editedAt).format("DD/MM/YYYY HH:mm")}`,
                    width: 150,
                  },
                ],
              },
            ],
            width: "100%",
          },
        ],
        margin: [0, 10, 0, 0],
      },
    ],
  };
};
