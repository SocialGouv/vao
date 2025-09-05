const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function displayInfosTransport(info) {
  const lines = [];

  lines.push([
    "Transport jusqu'au lieu de séjour :",
    info.responsableTransportLieuSejour.join(", "),
  ]);

  if (info.responsableTransportLieuSejour.includes("organisateur")) {
    lines.push([
      "Modes de transport utilisés par l'organisateur :",
      info.modeTransport.join(", "),
    ]);
    lines.push([
      "Mode d’organisation retenu :",
      info.precisionModeOrganisation,
    ]);
  }

  lines.push([
    "Déplacement durant le séjour :",
    info.deplacementDurantSejour ? "Oui" : "Non",
  ]);

  if (
    info.modeTransport?.includes("Automobile") ||
    info.modeTransport?.includes("Autobus, car") ||
    info.deplacementDurantSejour
  ) {
    lines.push(["Véhicules adaptés :", info.vehiculesAdaptes ? "Oui" : "Non"]);
    lines.push([
      "Spécificités des véhicules :",
      info.precisionVehiculesAdaptes,
    ]);
  }

  return MiseEnPage.buildLines(lines);
};
