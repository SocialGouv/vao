const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function displayResponsableOrganisation(resp) {
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
      MiseEnPage.formatLine("Nom :", resp.nom),
      MiseEnPage.formatLine("Prénom :", resp.prenom),
      MiseEnPage.formatLine("Téléphone :", resp.telephone),
      MiseEnPage.formatLine("Fonction :", resp.fonction),
      MiseEnPage.formatLine("Email :", resp.email),
      MiseEnPage.formatLine("Adresse :", resp.adresse.label),
    ],
  };
};
