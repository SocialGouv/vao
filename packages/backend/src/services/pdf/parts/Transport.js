const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function displayInfosTransport(info) {
  const liste = [];
  liste.push(
    MiseEnPage.formatLine(
      "Transport jusqu'au lieu de séjour :",
      info.responsableTransportLieuSejour.join(", "),
      { columnGap: 10 },
    ),
  );
  if (info.responsableTransportLieuSejour.includes("organisateur")) {
    liste.push(
      MiseEnPage.formatLine(
        "Modes de transport utilisés par l'organisateur :",
        info.modeTransport.join(", "),
        { columnGap: 10 },
      ),
      MiseEnPage.formatLine(
        "Mode d’organisation retenu :",
        info.precisionModeOrganisation,
        { columnGap: 10 },
      ),
    );
  }
  liste.push(
    MiseEnPage.formatLine(
      "Déplacement durant le séjour :",
      info.deplacementDurantSejour ? "Oui" : "Non",
      { columnGap: 10 },
    ),
  );
  if (
    info.modeTransport?.includes("Automobile") ||
    info.modeTransport?.includes("Autobus, car") ||
    info.deplacementDurantSejour
  ) {
    liste.push(
      MiseEnPage.formatLine(
        "Véhicules adaptés :",
        info.vehiculesAdaptes ? "Oui" : "Non",
        { columnGap: 10 },
      ),
    );
  }
  if (
    info.modeTransport?.includes("Automobile") ||
    info.modeTransport?.includes("Autobus, car") ||
    info.deplacementDurantSejour
  ) {
    liste.push(
      MiseEnPage.formatLine(
        "Spécificités des véhicules :",
        info.precisionVehiculesAdaptes,
        { columnGap: 10 },
      ),
    );
  }
  return liste;
};
