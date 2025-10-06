/**
 * Formats a string according to a specified pattern with separators
 * @param {number[]} pattern - Tableau de formatage de sortie
 * @param {string} input - Entrée
 * @param {string} separator - Séparateur de chaine de sortie
 * @returns {string} Format une chaine numérique suivant le format d'entrée :
 *  ex [2,3,4] devra contenir une chaine de 2+3+4 (9) caractères numériques en input  et séparateur " "
 *  123456789 sortira sous le format "12 345 6789"
 * */
function formatByPattern({ pattern, input = "", separator = " " }) {
  if (typeof input !== "string") input = String(input ?? "");
  const expectedLength = pattern.reduce((a, b) => a + b, 0);
  if (input.length !== expectedLength || !/^\d+$/.test(input)) return input;

  let i = 0;
  return pattern
    .map((len) => {
      const part = input.slice(i, i + len);
      i += len;
      return part;
    })
    .join(separator);
}

function formatSiret({ siret }) {
  return formatByPattern({ pattern: [3, 3, 3, 5], input: siret });
}

function formatSiren({ siren }) {
  return formatByPattern({ pattern: [3, 3, 3], input: siren });
}
module.exports = { formatSiren, formatSiret };
