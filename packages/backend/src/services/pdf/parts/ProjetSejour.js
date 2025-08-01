const { destinations } = require("../../../helpers/declaration/projet-sejour");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function buildProjetSejour(info) {
  const lines = [
    [
      "Destination :",
      info.destination.map((d) => destinations[d] ?? d).join(", "),
    ],
    [
      "Activités sportives et loisirs proposés :",
      info.activitesSportives.join(", "),
    ],
    ["Activités culturelles proposées :", info.activitesCulturelles.join(", ")],
    ["Bien être :", info.activitesBienEtre.join(", ")],
    [
      "Personnel ou organisme prévu le cas échéant pour encadrer les activités spécifiques :",
      info.activitesPersonnelPrevu ?? "",
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
            stack: MiseEnPage.buildLines(lines),
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
};
