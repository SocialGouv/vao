const {
  destinations,
} = require("../../../../helpers/declaration/projet-sejour");

module.exports = function buildProjetSejour(info) {
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
                    text: "Informations sur le projet séjour",
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
      {
        columns: [
          {
            alignment: "left",
            columnGap: 10,
            stack: [
              {
                columns: [
                  {
                    text: "Destination :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.destination.map((d) => destinations[d] ?? d).join(", ")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Activités sportives et loisirs proposés :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.activitesSportives.join(", ")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Activités culturelles proposées :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.activitesCulturelles.join(", ")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Bien être :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.activitesBienEtre.join(", ")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Personnel ou organisme prévu le cas échéant pour encadrer les activités spécifiques :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.activitesPersonnelPrevu ?? ""}`,
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
