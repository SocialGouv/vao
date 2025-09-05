const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function displayResponsableOrganisation(resp) {
  const lines = [
    ["Nom :", resp.nom],
    ["Prénom :", resp.prenom],
    ["Téléphone :", resp.telephone],
    ["Fonction :", resp.fonction],
    ["Email :", resp.email],
    ["Adresse :", resp.adresse.label],
  ];

  return {
    margin: MiseEnPage.MARGIN_UP_20,
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
      ...MiseEnPage.buildLines(lines, { marginUp: 0 }),
    ],
  };
};
