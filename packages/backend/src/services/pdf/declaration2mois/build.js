const PdfPrinter = require("pdfmake");
const daysjs = require("dayjs");
const path = require("path");
const dayjs = require("dayjs");
const Hebergement = require("../../Hebergement");
const logger = require("../../../utils/logger");

const log = logger(module.filename);

const fonts = {
  Marianne: {
    bold: path.join(__dirname, "..", "..", "../fonts/Marianne-Bold.woff"),
    italics: path.join(
      __dirname,
      "..",
      "..",
      "../fonts/Marianne-Light_Italic.woff",
    ),
    normal: path.join(__dirname, "..", "..", "../fonts/Marianne-Regular.woff"),
  },
};

const printer = new PdfPrinter(fonts);

function displayRepresentantLegaux(rl) {
  const displayableRL = [];
  rl.forEach((e) => {
    displayableRL.push({
      columns: [
        {
          text: "Nom, prénom et fonction :",
          width: 250,
        },
        {
          bold: true,
          text: `${e.nom} ${e.prenom}, ${e.fonction}`,
          width: 120,
        },
      ],
    });
  });

  return {
    margin: [0, 20, 0, 0],
    stack: [
      {
        columns: [
          {
            bold: true,
            decoration: "underline",
            text: "Représentants légaux",
            width: "100%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      ...displayableRL,
    ],
  };
}

function displayResponsableOrganisation(resp) {
  return {
    margin: [0, 20, 0, 0],
    stack: [
      {
        columns: [
          {
            bold: true,
            decoration: "underline",
            text: "Responsable de l'organisation du séjour",
            width: "100%",
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            text: "Nom :",
            width: 250,
          },
          {
            bold: true,
            text: `${resp.nom}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Prénom :",
            width: 250,
          },
          {
            bold: true,
            text: `${resp.prenom}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Téléphone :",
            width: 250,
          },
          {
            bold: true,
            text: `${resp.telephone}`,
            width: "*",
          },
        ],
      },
      {
        columns: [
          {
            text: "Fonction :",
            width: 250,
          },
          {
            bold: true,
            text: `${resp.fonction}`,
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
            text: `${resp.email}`,
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
            text: `${resp.adresse.label}`,
            width: "*",
          },
        ],
      },
    ],
  };
}

function displayOrganisme(responsableSejour, organisme) {
  if (organisme.typeOrganisme === "personne_morale") {
    return {
      columnGap: 10,
      margin: [0, 20, 0, 0],
      stack: [
        {
          columns: [
            {
              bold: true,
              decoration: "underline",
              text: "Organisme : personne morale",
              width: "100%",
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              text: "SIRET :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personneMorale.siret}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Raison sociale :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personneMorale.raisonSociale}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Nom commercial :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personneMorale.nomCommercial ?? ""}`,
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
              text: `${organisme.personneMorale.adresse}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Statut :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personneMorale.statut}`,
              width: "*",
            },
          ],
        },
        {
          columns: [
            {
              text: "Téléphone :",
              width: 250,
            },
            {
              bold: true,
              text: `${organisme.personneMorale.telephone}`,
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
              text: `${organisme.personneMorale.email}`,
              width: "*",
            },
          ],
        },
        displayRepresentantLegaux(organisme.personneMorale.representantsLegaux),
        displayResponsableOrganisation(responsableSejour),
      ],
    };
  } else {
    return {};
  }
}

function displayInfosSanitaires(info) {
  const liste = [];
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Dispositions d’ordre sanitaire spécifiques :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.dispositionsSpecifiques ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.dispositionsSpecifiques) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionDispositionsSpecifiques}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Composition de l'équipe :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.constitutionEquipe.join(", ")}`,
        width: "*",
      },
    ],
  });
  if (info.constitutionEquipe.length > 0) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionConstitutionEquipe}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Trousse à pharmacie :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.troussePharamcie ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Accord cabinet médical de proximite :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.accordCabinetMedical ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.accordCabinetMedical) {
    liste.push({
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionAccordCabinetMedical}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columns: [
      {
        text: "Personne en charge de la distribution, de l’administration et de l’enregistrement de l’administration des médicaments :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.responsableAdministrationMedicament.join(", ")}`,
        width: "*",
      },
    ],
  });
  if (info.responsableAdministrationMedicament.length > 0) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionResponsableAdministrationMedicament}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Stockage sécurisé des médicaments :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.stockageMedicamentSecurise ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.stockageMedicamentSecurise) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision sur le protocole en vigueur concernant le stockage sécurisé des médicaments :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionStockageMedicamentSecurise}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Dipositif de conservation des médicaments thermosensibles :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.conservationMedicamentThermosensible ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Dipositif d'individualisation des traitements de chaque vacancier :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.individualisationMedicaments ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.individualisationMedicaments) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision sur le protocole en vigueur concernant le stockage permettant l’individualisation des médicaments :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionIndividualisationMedicaments}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Méthode de préparation des piluliers :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.preparationPilluliers}`,
        width: "*",
      },
    ],
  });
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Prescription médicale jointe à chaque pilulier :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.prescriptionMedicaleJointe ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Protocole de modification de traitement en cours de séjour :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleModificationTraitement ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.protocoleModificationTraitement) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionProtocoleModificationTraitement}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Fiche de suivi de la distribution, de l’administration et de l’enregistrement des médicaments :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.ficheSuiviMedicaments ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Protocole d’évacuation et de rapatriement des vacanciers si nécessaire :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleEvacuation ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.protocoleEvacuation) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionProtocoleEvacuation}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Protocole en cas de chute, d’intoxication ou autre accident :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleAccident ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.protocoleAccident) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionProtocoleAccident}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Protocole de réorientation des vacanciers :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleReorientation ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.protocoleReorientation) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionProtocoleReorientation}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Protocole en cas d’alerte canicule :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleCanicule ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (info.protocoleReorientation) {
    liste.push({
      columns: [
        {
          text: "Précision :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionProtocoleCanicule}`,
          width: "*",
        },
      ],
    });
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Précision sur les conditions prévues pour la gestion sur place du budget personnel des vacanciers :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.gestionBudgetPersonnel}`,
        width: "*",
      },
    ],
  });

  return liste;
}

function displayInfosTransport(info) {
  const liste = [];
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Transport jusqu'au lieu de séjour :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.responsableTransportLieuSejour.join(", ")}`,
        width: "*",
      },
    ],
  });
  if (info.responsableTransportLieuSejour.includes("organisateur")) {
    liste.push(
      {
        columnGap: 10,
        columns: [
          {
            text: "Modes de transport utilisés :",
            width: 250,
          },
          {
            bold: true,
            text: `${info.modeTransport.join(", ")}`,
            width: "*",
          },
        ],
      },
      {
        columnGap: 10,
        columns: [
          {
            text: "Mode d’organisation retenu :",
            width: 250,
          },
          {
            bold: true,
            text: `${info.precisionModeOrganisation}`,
            width: "*",
          },
        ],
      },
    );
  }
  liste.push({
    columnGap: 10,
    columns: [
      {
        text: "Déplacement durant le séjour :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.deplacementDurantSejour ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
  });
  if (
    info.modeTransport?.includes("Automobile") ||
    info.modeTransport?.includes("Autobus, car") ||
    info.deplacementDurantSejour
  ) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Véhicules adaptés :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.vehiculesAdaptes ? "Oui" : "Non"}`,
          width: "*",
        },
      ],
    });
  }
  if (
    info.modeTransport?.includes("Automobile") ||
    info.modeTransport?.includes("Autobus, car") ||
    info.deplacementDurantSejour
  ) {
    liste.push({
      columnGap: 10,
      columns: [
        {
          text: "Sépcificités des véhicules :",
          width: 250,
        },
        {
          bold: true,
          text: `${info.precisionVehiculesAdaptes}`,
          width: "*",
        },
      ],
    });
  }
  return liste;
}

function buildHeader() {
  return {
    columns: [
      {
        stack: [
          {
            alignment: "left",
            image: path.join(__dirname, "..", "..", "../images/logo.png"),
            width: 80,
          },
        ],
      },
      {
        stack: [
          {
            alignment: "right",
            image: path.join(
              __dirname,
              "..",
              "..",
              "../images/cerfa-12672-03.png",
            ),
            width: 50,
          },
        ],
      },
    ],
    margin: [10, 10, 10, 10],
  };
}

function buildTitre(declaration, departementSuivi) {
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
}

function buildAgrement(agrement) {
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
                    text: "Arrêté portant décision de l'agrément",
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
        columnGap: 10,
        margin: [0, 20, 0, 0],
        stack: [
          {
            columns: [
              {
                text: "Numéro d'agrément :",
                width: 250,
              },
              {
                bold: true,
                text: `${agrement.numero}`,
                width: "*",
              },
            ],
          },
          {
            columns: [
              {
                text: "Date d'obtention de l'agrément :",
                width: 250,
              },
              {
                bold: true,
                text: `${dayjs(agrement.dateObtention).format("DD/MM/YYYY")}`,
                width: "*",
              },
            ],
          },
          {
            columns: [
              {
                text: "Région d'obtention de l'agrément :",
                width: 250,
              },
              {
                bold: true,
                text: `${agrement.regionObtention}`,
                width: "*",
              },
            ],
          },
          {
            columns: [
              {
                text: "Nom du fichier téléversé :",
                width: 250,
              },
              {
                bold: true,
                text: `${agrement.file.name}`,
                width: "*",
              },
            ],
          },
        ],
      },
    ],
  };
}

function buildInformationsGenerales(declaration) {
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
                    text: "Informations générales",
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
                    text: "Libellé du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.libelle}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Date indicative de début du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${dayjs(declaration.dateDebut).format("DD/MM/YYYY")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Date indicative de fin du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${dayjs(declaration.dateFin).format("DD/MM/YYYY")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Saison :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.periode}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Durée du séjour :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${declaration.duree} jours`,
                    width: "*",
                  },
                ],
              },
              displayOrganisme(
                declaration.responsableSejour,
                declaration?.organisme,
              ),
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
}

function buildInformationsVacanciers(info) {
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
                    text: "Informations prévisionnelles sur les vacanciers",
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
                    text: "Effectif prévisionnel des vacanciers :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.effectifPrevisionnel}`,
                    width: 40,
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Répartition Femmes / Hommes :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.effectifPrevisionnelFemme} / ${info.effectifPrevisionnelHomme}`,
                    width: 40,
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Tranches d'âge :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.trancheAge.join(", ")}`,
                    width: "*",
                  },
                ],
              },
              {
                columns: [
                  {
                    text: "Type de déficience :",
                    width: 250,
                  },
                  {
                    bold: true,
                    text: `${info.typeDeficiences.join(", ")}`,
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
}

function buildInformationsPersonnel(info) {
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
}

function buildProjetSejour(info) {
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
                    text: `${info.destination.join(", ")}`,
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
            ],
          },
        ],
        margin: [0, 20, 0, 0],
      },
    ],
  };
}

function buildInformationsTransport(info) {
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
      {
        columnGap: 10,
        columns: [
          {
            alignment: "left",
            columnGap: 10,
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
      ...displayInfosTransport(info),
    ],
  };
}

function buildInformationsSanitaire(info) {
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
                    text: "Informations sanitaires",
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
        margin: [0, 20, 0, 0],
      },
      ...displayInfosSanitaires(info),
    ],
  };
}

async function buildFicheAnnexe(hebergement) {
  const liste = [];
  for (const h of hebergement.hebergements) {
    const details = await Hebergement.getOne({ id: h.hebergementId });
    if (details) {
      liste.push({
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
                        text: `${h.informationsLocaux.type}`,
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
                        text: `${details.nom}`,
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
                        text: `${details.coordonnees.adresse.label}`,
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
                        text: `${details.coordonnees.nomGestionnaire}`,
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
                        text: `${details.coordonnees.numTelephone1}`,
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
                        text: `${details.coordonnees.numTelephone2 ?? ""}`,
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
                        text: `${details.coordonnees.email}`,
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
                        text: `${dayjs(h.coordonnees.dateDebut).format("DD/MM/YYYY")}`,
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
                        text: `${dayjs(h.coordonnees.dateFin).format("DD/MM/YYYY")}`,
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
                        text: "Lieu d’hébergement soumis à la réglementation ERP (établissement recevant du public) :",
                        width: 250,
                      },
                      {
                        bold: true,
                        text: `${h.informationsLocaux.reglementationErp ? " Oui" : "Non"}`,
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
                        text: `${h.informationsLocaux.accessibilite}`,
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
                        text: `${h.informationsLocaux.pension}`,
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
                        text: `${h.informationsLocaux.prestationsHotelieres.join(", ")}`,
                        width: "*",
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: "Description du lieu d’hébergement (parties communes, notamment équipements sanitaires) :",
                        width: 250,
                      },
                      {
                        bold: true,
                        text: `${h.informationsLocaux.descriptionLieuHebergement}`,
                        width: "*",
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: "Nombre de couchage :",
                        width: 250,
                      },
                      {
                        bold: true,
                        text: `${h.informationsLocaux.nombreLits}`,
                        width: "*",
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: "Nombre de lits superposés inclus :",
                        width: 250,
                      },
                      {
                        bold: true,
                        text: `${h.informationsLocaux.nombreLitsSuperposes}`,
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
                        text: `${h.informationsLocaux.litsDessus ? " Oui" : "Non"}`,
                        width: "*",
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: "Nombre maximum de personnes prévues par espace de couchage :",
                        width: 250,
                      },
                      {
                        bold: true,
                        text: `${h.informationsLocaux.nombreMaxPersonnesCouchage}`,
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
                        text: `${h.informationsLocaux.couchageIndividuel ? "Oui" : "Non"}`,
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
                        text: `${h.informationsLocaux.rangementIndividuel ? "Oui" : "Non"}`,
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
                        text: `${h.informationsLocaux.chambresUnisexes ? "Non" : "Oui"}`,
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
                        text: `${h.informationsLocaux.amenagementsSpecifiques ? "Oui" : "Non "}`,
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
                        text: `${h.informationsLocaux.precisionAmenagementsSpecifiques ?? ""}`,
                        width: "*",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
    }
  }
  return liste;
}

function buildAttestation(attestation) {
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
            text: `Je, soussigné ${attestation.nom} ${attestation.prenom}, en qualité de ${attestation.qualite}, certifie le ${daysjs(attestation.at).format("DD/MM/YYYY")} sur l'honneur que les renseignements portés sur cette déclaration sont exacts.`,
            width: "*",
          },
        ],
      },
    ],
  };
}

const build = async (declaration = {}, departementSuivi) => {
  log.i("build - IN");
  const docDefinition = {
    content: [
      buildHeader(),
      buildTitre(declaration, departementSuivi),
      buildAgrement(declaration.organisme.agrement),
      buildInformationsGenerales(declaration),
      {
        headlineLevel: 1,
        stack: [buildHeader()],
      },
      buildInformationsVacanciers(declaration.informationsVacanciers),
      buildInformationsPersonnel(declaration.informationsPersonnel),
      buildProjetSejour(declaration.informationsProjetSejour),
      buildInformationsTransport(declaration.informationsTransport),
      {
        headlineLevel: 1,
        stack: [buildHeader()],
      },
      buildInformationsSanitaire(declaration.informationsSanitaires),
      {
        headlineLevel: 1,
        stack: [buildHeader()],
      },
      buildAttestation(declaration.attestation),
      {
        headlineLevel: 1,
        stack: [buildHeader()],
      },
      ...(await buildFicheAnnexe(declaration.hebergement)),
    ],
    defaultStyle: {
      font: "Marianne",
      fontSize: 9,
    },
    footer: function (currentPage, pageCount) {
      return [
        {
          alignment: "right",
          margin: [5, 5, 15, 5],
          text: `${currentPage.toString()}/${pageCount}`,
        },
      ];
    },
    pageBreakBefore: function (currentNode) {
      return currentNode.headlineLevel === 1;
    },
  };
  return new Promise((resolve) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    let result;

    pdfDoc.on("data", (chunk) => {
      chunks.push(chunk);
    });
    pdfDoc.on("end", () => {
      result = Buffer.concat(chunks);
      log.i("build - DONE");
      resolve(result);
    });
    pdfDoc.end();
  });
};

module.exports = build;
