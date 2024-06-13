module.exports = function displayRepresentantLegaux(rl) {
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
};
