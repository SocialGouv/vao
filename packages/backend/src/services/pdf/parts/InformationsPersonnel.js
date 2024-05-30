module.exports = function buildInformationsPersonnel(info) {
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
            stack: [
              {
                columns: [
                  {
                    text: "Nombre de personnes responsables présentes :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.nombreResponsable}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Nombre d'accompagnants présents :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.nombreAccompagnant}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Procédure de recrutement supplémentaires durant le séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.procedureRecrutementSupplementaire ? "Oui" : "Non"}`,
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
