const daysjs = require("dayjs");

module.exports = function buildAttestation(attestation) {
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
                    text: "Attestation sur l'honneur",
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
            text: `Je soussigné(e), ${attestation.nom} ${attestation.prenom}, en qualité de ${attestation.qualite}, certifie le ${daysjs(attestation.at).format("DD/MM/YYYY")} sur l'honneur que les renseignements portés sur cette déclaration sont exacts.`,
            width: "*",
          },
        ],
      },
    ],
  };
};
