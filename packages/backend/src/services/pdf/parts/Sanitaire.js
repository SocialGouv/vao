const {
  constitutionEquipes,
  preparationPillulierss,
  responsableAdministrationMedicaments,
} = require("../../../helpers/declaration/protocole-sanitaire");

module.exports = function displayInfosSanitaires(info) {
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
        text: `${info.constitutionEquipe.map((e) => constitutionEquipes[e] ?? e).join(", ")}`,
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
        text: "Existence d'un accord passé avec un cabinet médical ou paramédical à  proximité des lieux de séjour :",
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
      columnGap: 10,
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
    columnGap: 10,
    columns: [
      {
        text: "Présence d’une trousse à pharmacie de premier secours :",
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
        text: "Personne désignée en charge de la distribution et de l’administration des médicaments et de l’enregistrement de l’administration :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.responsableAdministrationMedicament.map((r) => responsableAdministrationMedicaments[r] ?? r).join(", ")}`,
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
        text: "Stockage des médicaments dans un lieu sécurisé et garantissant leur parfaite conservation :",
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
        text: "Existence d'un dispositif pour la conservation des médicaments thermosensibles :",
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
        text: "Existence d'un dispositif pour individualiser les traitements de chaque vacancier :",
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
        text: "Méthode retenue pour la préparation des piluliers :",
        width: 250,
      },
      {
        bold: true,
        text: `${preparationPillulierss[info.preparationPilluliers] ?? info.preparationPilluliers}`,
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
        text: "Existence d'un protocole d’évacuation et de rapatriement des vacanciers si nécessaire :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleEvacuation ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
    margin: [0, 10, 0, 0],
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
        text: "Existence d'un protocole en cas de chute, d’intoxication ou autre accident :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleAccident ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
    margin: [0, 10, 0, 0],
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
        text: "Existence d'un protocole de réorientation des vacanciers :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleReorientation ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
    margin: [0, 10, 0, 0],
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
        text: "Existence d'un protocole en cas d’alerte canicule :",
        width: 250,
      },
      {
        bold: true,
        text: `${info.protocoleCanicule ? "Oui" : "Non"}`,
        width: "*",
      },
    ],
    margin: [0, 10, 0, 0],
  });
  if (info.protocoleCanicule) {
    liste.push({
      columnGap: 10,
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
    margin: [0, 10, 0, 0],
  });

  return liste;
};
