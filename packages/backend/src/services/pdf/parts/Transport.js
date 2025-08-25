const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function displayInfosTransport(info) {
  const lines = [];

  lines.push([
    "Transport jusqu'au lieu de séjour :",
    info.responsableTransportLieuSejour.join(", "),
    { columnGap: 10 },
  ]);

  if (info.responsableTransportLieuSejour.includes("organisateur")) {
    lines.push([
      "Modes de transport utilisés par l'organisateur :",
      info.modeTransport.join(", "),
      { columnGap: 10 },
    ]);
    lines.push([
      "Mode d’organisation retenu :",
      info.precisionModeOrganisation,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Déplacement durant le séjour :",
    info.deplacementDurantSejour ? "Oui" : "Non",
    { columnGap: 10 },
  ]);

  if (
    info.modeTransport?.includes("Automobile") ||
    info.modeTransport?.includes("Autobus, car") ||
    info.deplacementDurantSejour
  ) {
    lines.push([
      "Véhicules adaptés :",
      info.vehiculesAdaptes ? "Oui" : "Non",
      { columnGap: 10 },
    ]);
    lines.push([
      "Spécificités des véhicules :",
      info.precisionVehiculesAdaptes,
      { columnGap: 10 },
    ]);
  }

  return MiseEnPage.buildLines(lines);
};
