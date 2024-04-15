module.exports = function displayResponsableOrganisation(resp) {
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
};
