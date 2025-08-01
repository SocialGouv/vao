const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function buildFicheAnnexe(hebergement) {
  return hebergement.hebergements.map((h) => ({
    stack: [
      {
        columns: [
          {
            alignment: "left",
            columnGap: 10,
            stack: [
              {
                margin: [0, 20, 0, 0],
                stack: [
                  {
                    columns: [
                      {
                        bold: true,
                        decoration: "underline",
                        text: `Caractéristiques relative à l'hébergement ${h.nom}`,
                        width: "100%",
                      },
                    ],
                    margin: [0, 0, 0, 10],
                  },
                ],
              },
              ...MiseEnPage.buildLines([
                [
                  "Véhicules adaptés :",
                  `${h.informationsTransport.vehiculesAdaptes ? "Oui" : "Non"}`,
                ],
                [
                  "Fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité :",
                  `${h.informationsTransport.deplacementProximite}`,
                ],
                [
                  "Fréquence, les distances et le mode de transport utilisé pour les excursions :",
                  `${h.informationsTransport.excursion}`,
                ],
              ]),
              ...(h.informationsTransport.rejoindreEtape
                ? [
                    {
                      ...MiseEnPage.formatLine(
                        "Mode de transport utilisé pour rejoindre cette étape :",
                        h.informationsTransport.rejoindreEtape,
                      ),
                    },
                  ]
                : []),
            ],
          },
        ],
      },
    ],
  }));
};
