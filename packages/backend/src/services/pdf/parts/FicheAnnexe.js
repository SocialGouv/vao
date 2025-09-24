const MiseEnPage = require("../../../helpers/declaration/mise-en-page");
const dayjs = require("dayjs");
const {
  pensions,
  prestationsHotelieres,
  accessibilites,
  types,
} = require("../../../helpers/declaration/hebergement");

module.exports = function buildFicheAnnexe(hebergement) {
  return hebergement.hebergements.map((h) => ({
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
              ...MiseEnPage.buildLines(
                [
                  [
                    "Type d'hébergement :",
                    types[h.informationsLocaux.type] ??
                      h.informationsLocaux.type,
                  ],
                  ["Nom de l'hébergement :", h.nom],
                  ["Adresse :", h.coordonnees.adresse.label],
                  ["Nom du gestionnaire :", h.coordonnees.nomGestionnaire],
                  ["Numéro de téléphone 1 :", h.coordonnees.numTelephone1],
                  [
                    "Numéro de téléphone 2 :",
                    h.coordonnees.numTelephone2 ?? "",
                  ],
                  ["Email :", h.coordonnees.email],
                  [
                    "Date de début de séjour dans le lieu :",
                    dayjs(h.dateDebut).format("DD/MM/YYYY"),
                  ],
                  [
                    "Date de fin de séjour dans le lieu :",
                    dayjs(h.dateFin).format("DD/MM/YYYY"),
                  ],
                ],
                { marginUp: 0 },
              ),
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
              MiseEnPage.formatLine(
                "Visite effectuée des locaux par l’organisateur :",
                h.informationsLocaux.visiteLocaux ? " Oui" : "Non",
              ),
              h.informationsLocaux.visiteLocaux &&
              h.informationsLocaux?.visiteLocauxAt
                ? MiseEnPage.formatLine(
                    "Date de la dernière visite des locaux par l'organisateur :",
                    dayjs(h.informationsLocaux.visiteLocauxAt).format(
                      "DD/MM/YYYY",
                    ),
                  )
                : "",
              ...MiseEnPage.buildLines([
                [
                  "Lieu d’hébergement soumis à la réglementation ERP :",
                  h.informationsLocaux.reglementationErp ? " Oui" : "Non",
                ],
                [
                  "Accessibilité :",
                  accessibilites[h.informationsLocaux.accessibilite] ??
                    h.informationsLocaux.accessibilite,
                ],
                [
                  "Type de pension :",
                  pensions[h.informationsLocaux.pension] ??
                    h.informationsLocaux.pension,
                ],
                [
                  "Prestations hôtelières assurées :",
                  h.informationsLocaux.prestationsHotelieres
                    .map((p) => prestationsHotelieres[p] ?? p)
                    .join(", "),
                ],
                [
                  "Description du lieu d’hébergement :",
                  h.informationsLocaux.descriptionLieuHebergement,
                ],
                ["Nombre de couchages :", h.informationsLocaux.nombreLits],
              ]),
              ...MiseEnPage.buildLines(
                h.informationsLocaux.nombreLitsSuperposes
                  ? [
                      [
                        "Nombre de lits superposés inclus :",
                        h.informationsLocaux.nombreLitsSuperposes,
                      ],
                      [
                        "Lits superposés « du dessus » occupés par les vacanciers :",
                        h.informationsLocaux.litsDessus ? " Oui" : "Non",
                      ],
                    ]
                  : [],
              ),
              ...MiseEnPage.buildLines([
                [
                  "Nombre maximum de personnes prévues par espace de couchage :",
                  h.informationsLocaux.nombreMaxPersonnesCouchage,
                ],
                [
                  "Couchage individuel :",
                  h.informationsLocaux.couchageIndividuel ? " Oui" : "Non",
                ],
                [
                  "Espace de rangement des affaires personnelles :",
                  h.informationsLocaux.rangementIndividuel ? " Oui" : "Non",
                ],
                [
                  "Chambres mixtes :",
                  h.informationsLocaux.chambresUnisexes ? " Non" : "Oui",
                ],
                [
                  "Aménagements spécifiques des locaux pour les vacanciers :",
                  h.informationsLocaux.amenagementsSpecifiques
                    ? " Oui"
                    : "Non ",
                ],
                [
                  "Précision sur aménagements spécifiques :",
                  h.informationsLocaux.precisionAmenagementsSpecifiques ?? "",
                ],
              ]),
              ...(h.informationsLocaux.reglementationErp
                ? MiseEnPage.buildLines(
                    [
                      h.informationsLocaux.fileDerniereAttestationSecurite && [
                        "Attestation de passage de la commission sécurité :",
                        h.informationsLocaux.fileDerniereAttestationSecurite
                          .name,
                      ],
                      h.informationsLocaux
                        .fileDernierArreteAutorisationMaire && [
                        "Arrêté d'autorisation du maire :",
                        h.informationsLocaux.fileDernierArreteAutorisationMaire
                          .name,
                      ],
                    ].filter(Boolean),
                  )
                : MiseEnPage.buildLines([
                    [
                      "Réponse du propriétaire ou exploitant indiquant les raisons pour lesquelles le lieu d’hébergement n’est pas soumis à la réglementation ERP :",
                      h.informationsLocaux.fileReponseExploitantOuProprietaire
                        ? h.informationsLocaux
                            .fileReponseExploitantOuProprietaire.name
                        : "",
                    ],
                  ])),
            ],
          },
        ],
      },
    ],
  }));
};
