const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function displayRepresentantLegaux(rl) {
  const displayableRL = [];
  rl.forEach((e) => {
    displayableRL.push(
      MiseEnPage.formatLine(
        "Nom, prénom et fonction :",
        `${e.nom} ${e.prenom}, ${e.fonction}`,
      ),
    );
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
};
