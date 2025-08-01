module.exports.MARGIN_UP_30 = [0, 30, 0, 0]; // [haut, droite, bas, gauche] - marge haute à 30 pour le titre
module.exports.MARGIN_UP_20 = [0, 20, 0, 0]; // [haut, droite, bas, gauche] - marge haute à 30 pour le titre
module.exports.TEXT_LINE_MARGIN = [0, 5, 0, 0]; // [haut, droite, bas, gauche] - marge haute à 5 pour le texte
module.exports.formatLine = (label, value, params = {}) => {
  return {
    columnGap: params.columnGap || 0,
    columns: [
      {
        text: `${label}`,
        width: 250,
      },
      {
        bold: true,
        text: `${value ?? ""}`,
        width: params.withValue || "*",
      },
    ],
    margin: [0, params.marginUp || 5, 0, params.marginRight || 0],
  };
};
