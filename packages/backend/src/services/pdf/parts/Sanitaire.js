const {
  constitutionEquipes,
  preparationPillulierss,
  responsableAdministrationMedicaments,
} = require("../../../helpers/declaration/protocole-sanitaire");
const MiseEnPage = require("../../../helpers/declaration/mise-en-page");

module.exports = function displayInfosSanitaires(info) {
  const lines = [];

  lines.push([
    "Dispositions d’ordre sanitaire spécifiques :",
    info.dispositionsSpecifiques ? "Oui" : "Non",
    { columnGap: 10 },
  ]);
  if (info.dispositionsSpecifiques) {
    lines.push([
      "Précision :",
      info.precisionDispositionsSpecifiques,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Composition de l'équipe :",
    info.constitutionEquipe.map((e) => constitutionEquipes[e] ?? e).join(", "),
    { columnGap: 10 },
  ]);
  if (info.constitutionEquipe.length > 0) {
    lines.push([
      "Précision :",
      info.precisionConstitutionEquipe,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Existence d'un accord passé avec un cabinet médical ou paramédical à  proximité des lieux de séjour :",
    info.accordCabinetMedical ? "Oui" : "Non",
    { columnGap: 10 },
  ]);
  if (info.accordCabinetMedical) {
    lines.push([
      "Précision :",
      info.precisionAccordCabinetMedical,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Présence d’une trousse à pharmacie de premier secours :",
    info.troussePharmacie ? "Oui" : "Non",
    { columnGap: 10 },
  ]);

  lines.push([
    "Personne désignée en charge de la distribution et de l’administration des médicaments et de l’enregistrement de l’administration :",
    info.responsableAdministrationMedicament
      .map((r) => responsableAdministrationMedicaments[r] ?? r)
      .join(", "),
    { columnGap: 10 },
  ]);
  if (info.responsableAdministrationMedicament.length > 0) {
    lines.push([
      "Précision :",
      info.precisionResponsableAdministrationMedicament,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Stockage des médicaments dans un lieu sécurisé et garantissant leur parfaite conservation :",
    info.stockageMedicamentSecurise ? "Oui" : "Non",
    { columnGap: 10 },
  ]);
  if (info.stockageMedicamentSecurise) {
    lines.push([
      "Précision sur le protocole en vigueur concernant le stockage sécurisé des médicaments :",
      info.precisionStockageMedicamentSecurise,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Existence d'un dispositif pour la conservation des médicaments thermosensibles :",
    info.conservationMedicamentThermosensible ? "Oui" : "Non",
    { columnGap: 10 },
  ]);

  lines.push([
    "Existence d'un dispositif pour individualiser les traitements de chaque vacancier :",
    info.individualisationMedicaments ? "Oui" : "Non",
    { columnGap: 10 },
  ]);
  if (info.individualisationMedicaments) {
    lines.push([
      "Précision sur le protocole en vigueur concernant le stockage permettant l’individualisation des médicaments :",
      info.precisionIndividualisationMedicaments,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Méthode retenue pour la préparation des piluliers :",
    preparationPillulierss[info.preparationPilluliers] ??
      info.preparationPilluliers,
    { columnGap: 10 },
  ]);

  lines.push([
    "Prescription médicale jointe à chaque pilulier :",
    info.prescriptionMedicaleJointe ? "Oui" : "Non",
    { columnGap: 10 },
  ]);

  lines.push([
    "Protocole de modification de traitement en cours de séjour :",
    info.protocoleModificationTraitement ? "Oui" : "Non",
    { columnGap: 10 },
  ]);
  if (info.protocoleModificationTraitement) {
    lines.push([
      "Précision :",
      info.precisionProtocoleModificationTraitement,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Fiche de suivi de la distribution, de l’administration et de l’enregistrement des médicaments :",
    info.ficheSuiviMedicaments ? "Oui" : "Non",
    { columnGap: 10 },
  ]);

  lines.push([
    "Existence d'un protocole d’évacuation et de rapatriement des vacanciers si nécessaire :",
    info.protocoleEvacuation ? "Oui" : "Non",
    { columnGap: 10, marginUp: 10 },
  ]);
  if (info.protocoleEvacuation) {
    lines.push([
      "Précision :",
      info.precisionProtocoleEvacuation,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Existence d'un protocole en cas de chute, d’intoxication ou autre accident :",
    info.protocoleAccident ? "Oui" : "Non",
    { columnGap: 10, marginUp: 10 },
  ]);
  if (info.protocoleAccident) {
    lines.push([
      "Précision :",
      info.precisionProtocoleAccident,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Existence d'un protocole de réorientation des vacanciers :",
    info.protocoleReorientation ? "Oui" : "Non",
    { columnGap: 10, marginUp: 10 },
  ]);
  if (info.protocoleReorientation) {
    lines.push([
      "Précision :",
      info.precisionProtocoleReorientation,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Existence d'un protocole en cas d’alerte canicule :",
    info.protocoleCanicule ? "Oui" : "Non",
    { columnGap: 10, marginUp: 10 },
  ]);
  if (info.protocoleCanicule) {
    lines.push([
      "Précision :",
      info.precisionProtocoleCanicule,
      { columnGap: 10 },
    ]);
  }

  lines.push([
    "Précision sur les conditions prévues pour la gestion sur place du budget personnel des vacanciers :",
    info.gestionBudgetPersonnel,
    { columnGap: 10, marginUp: 10 },
  ]);

  return MiseEnPage.buildLines(lines);
};
