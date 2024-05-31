const dayjs = require("dayjs");
const {
  pensions,
  prestationsHotelieres,
  accessibilites,
  types,
} = require("../../../../helpers/declaration/hebergement");

module.exports = function buildFicheAnnexe(hebergement) {
  return hebergement.hebergements.map((hebergement) => ({
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
                    font: "Marianne",
                    fontSize: 10,
                    text: `Fiche annexe`,
                    width: "300",
                  },
                ],
              },
            ],
          ],
          headerRows: 1,
          layout: { noBorders: true },
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
                margin: [0, 20, 0, 0],
                stack: [
                  {
                    columns: [
                      {
                        bold: true,
                        decoration: "underline",
                        text: "Caractéristiques de l'hébergement",
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
                    text: "Type d'hébergement :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${types[hebergement.informationsLocaux.type] ?? hebergement.informationsLocaux.type}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Nom de l'hébergement :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.nom}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Adresse :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.coordonnees.adresse.label}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Nom du gestionnaire :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.coordonnees.nomGestionnaire}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Numéro de téléphone 1 :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.coordonnees.numTelephone1}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Numéro de téléphone 2 :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.coordonnees.numTelephone2 ?? ""}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Email :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.coordonnees.email}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Date de début de séjour dans le lieu :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${dayjs(hebergement.dateDebut).format("DD/MM/YYYY")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Date de fin de séjour dans le lieu :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${dayjs(hebergement.dateFin).format("DD/MM/YYYY")}`,
                    width: "*",
                  },
                ],
              },
              {
                margin: [0, 20, 0, 0],
                stack: [
                  {
                    columns: [
                      {
                        bold: true,
                        decoration: "underline",
                        text: "Informations sur les locaux",
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
                    text: "Visite effectuée des locaux par l’organisateur :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.visiteLocaux ? " Oui" : "Non"}`,
                    width: "*",
                  },
                ],
              },
              ...(hebergement.informationsLocaux.visiteLocaux &&
              hebergement.informationsLocaux.visiteLocauxAt
                ? [
                    {
                      columns: [
                        {
                          text: "Date de la dernière visite des locaux par l'organisateur :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${dayjs(hebergement.informationsLocaux.visiteLocauxAt).format("DD/MM/YYYY")}`,
                          width: "*",
                        },
                      ],
                    },
                  ]
                : []),
              {
                columns: [
                  {
                    text: "Lieu d’hébergement soumis à la réglementation ERP :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.reglementationErp ? " Oui" : "Non"}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Accessibilité :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${accessibilites[hebergement.informationsLocaux.accessibilite] ?? hebergement.informationsLocaux.accessibilite}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Type de pension :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${pensions[hebergement.informationsLocaux.pension] ?? hebergement.informationsLocaux.pension}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Prestations hôtelières assurées :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.prestationsHotelieres.map((p) => prestationsHotelieres[p] ?? p).join(", ")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Description du lieu d’hébergement :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.descriptionLieuHebergement}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Nombre de couchages :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.nombreLits}`,
                    width: "*",
                  },
                ],
              },
              ...(hebergement.informationsLocaux.nombreLitsSuperposes
                ? [
                    {
                      columns: [
                        {
                          text: "Nombre de lits superposés inclus :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${hebergement.informationsLocaux.nombreLitsSuperposes}`,
                          width: "*",
                        },
                      ],
                    },
                    {
                      columns: [
                        {
                          text: "Lits superposés « du dessus » occupés par les vacanciers :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${hebergement.informationsLocaux.litsDessus ? " Oui" : "Non"}`,
                          width: "*",
                        },
                      ],
                    },
                  ]
                : []),
              {
                columns: [
                  {
                    text: "Nombre maximum de personnes prévues par espace de couchage :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.nombreMaxPersonnesCouchage}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Couchage individuel :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.couchageIndividuel ? "Oui" : "Non"}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Espace de rangement des affaires personnelles :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.rangementIndividuel ? "Oui" : "Non"}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Chambres mixtes :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.chambresUnisexes ? "Non" : "Oui"}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Aménagements spécifiques des locaux pour les vacanciers :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.amenagementsSpecifiques ? "Oui" : "Non "}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Précision sur aménagements spécifiques :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${hebergement.informationsLocaux.precisionAmenagementsSpecifiques ?? ""}`,
                    width: "*",
                  },
                ],

                margin: [0, 0, 0, 10],
              },
              ...(hebergement.informationsLocaux.reglementationErp
                ? [
                    hebergement.informationsLocaux
                      .fileDerniereAttestationSecurite && {
                      columns: [
                        {
                          text: "Attestation de passage de la comission sécurité :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${hebergement.informationsLocaux.fileDerniereAttestationSecurite.name}`,
                          width: "*",
                        },
                      ],
                    },
                    hebergement.informationsLocaux
                      .fileDernierArreteAutorisationMaire && {
                      columns: [
                        {
                          text: "Arrêté d'autorisation du maire :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${hebergement.informationsLocaux.fileDernierArreteAutorisationMaire.name}`,
                          width: "*",
                        },
                      ],
                    },
                  ].filter((d) => d)
                : [
                    {
                      columns: [
                        {
                          text: "Réponse du propriétaire ou exploitant indiquant les raisons pour lesquelles le lieu d’hébergement n’est pas soumis à la réglementation ERP :",
                          width: 250,
                        },
                        {
                          bold: true,
                          text: `${hebergement.informationsLocaux.fileReponseExploitantOuProprietaire.name}`,
                          width: "*",
                        },
                      ],
                    },
                  ]),
            ],
          },
        ],
      },
    ],
  }));
};
