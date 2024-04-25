module.exports = function buildFicheAnnexe(hebergement) {
  return hebergement.hebergements.map((hebergement) => ({
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
                        text: `Caractéristiques relative à l'hébergement ${hebergement.nom}`,
                        width: "100%",
                      },
                    ],
                    margin: [0, 0, 0, 10],
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Véhicules adaptés :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsTransport.vehiculesAdaptes ? "Oui" : "Non"}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Fréquence, les distances et le mode de transport utilisé pour les déplacements de proximité :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsTransport.deplacementProximite}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Fréquence, les distances et le mode de transport utilisé pour les excursions :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsTransport.excursion}`,
                    width: "*",
                  },
                ],
              },
              ...(hebergement.informationsTransport.rejoindreEtape
                ? [
                    {
                      columns: [
                        {
                          text: "Mode de transport utilisé pour rejoindre cette étape :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${hebergement.informationsTransport.rejoindreEtape}`,
                          width: "*",
                        },
                      ],
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
