module.exports = function displayInfosTransport(info) {
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
            text: "Modes de transport utilisés par l'organisateur :",
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
          text: "Spécificités des véhicules :",
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
};
