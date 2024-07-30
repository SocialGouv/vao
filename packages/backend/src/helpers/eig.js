const dayjs = require("dayjs");
const dsStatuts = require("./ds-statuts");

module.exports.statuts = {
  BROUILLON: "BROUILLON",
  ENVOYE: "ENVOYE",
};

const Categorie = {
  FONCTIONNEMENT_ORGANISME: "FONCTIONNEMENT_ORGANISME",
  SANTE: "SANTE",
  SECURITE: "SECURITE",
  VICTIMES: "VICTIMES",
};

module.exports.Categorie = Categorie;

const Types = {
  [Categorie.VICTIMES]: {
    AUTRE: "AUTRE__VICTIMES",
    MALTRAITANCES_NON_PRECISEES: "MALTRAITANCES_NON_PRECISEES",
    NEGLIGENCE_GRAVE_OU_ERREURS_SUCCESSIVES:
      "NEGLIGENCE_GRAVE_OU_ERREURS_SUCCESSIVES",
    NON_RESPECT_PRESCRIPTION_MEDICALE: "NON_RESPECT_PRESCRIPTION_MEDICALE",
    PRIVATION_DE_DROIT: "PRIVATION_DE_DROIT",
    SUICIDE: "SUICIDE",
    TENTATIVE_DE_SUICIDE: "TENTATIVE_DE_SUICIDE",
    VIOLENCES_PHYSIQUES: "VIOLENCES_PHYSIQUES",
    VIOLENCES_PSYCHOLOGIQUES_ET_MORALES: "VIOLENCES_PSYCHOLOGIQUES_ET_MORALES",
    VIOLENCES_SEXUELLES: "VIOLENCES_SEXUELLES",
    VIOLS: "VIOLS",
  },
  [Categorie.SANTE]: {
    ACCIDENT_CORPOREL: "ACCIDENT_CORPOREL",
    AUTRE: "AUTRE__SANTE",
    EPIDEMIE: "EPIDEMIE",
  },
  [Categorie.SECURITE]: {
    ACTES_DE_MALVEILLANCE: "ACTES_DE_MALVEILLANCE",
    AUTRE: "AUTRE__SECURITE",
    DEPART_DE_FEU: "DEPART_DE_FEU",
    FUGUE: "FUGUE",
    INCENDIE: "INCENDIE",
    INONDATION: "INONDATION",
    INTOXICATION_ALIMENTAIRE: "INTOXICATION_ALIMENTAIRE",
    VOLS: "VOLS",
  },
  [Categorie.FONCTIONNEMENT_ORGANISME]: {
    AUTRE: "AUTRE__FONCTIONNEMENT_ORGANISME",
    CONFLITS_OU_MENACES_DE_CONFLITS_INTERNES:
      "CONFLITS_OU_MENACES_DE_CONFLITS_INTERNES",
    DEFAILLANCES_TECHNIQUES: "DEFAILLANCES_TECHNIQUES",
    DEFAILLANCE_DE_PERSONNELS: "DEFAILLANCE_DE_PERSONNELS",
    PROCEDURES_JUDICIAIRES_CONTRE_LE_PERSONNELS:
      "PROCEDURES_JUDICIAIRES_CONTRE_LE_PERSONNELS",
  },
};

module.exports.Types = Types;

const mapEigToLabel = {
  [Types[Categorie.VICTIMES].VIOLENCES_SEXUELLES]: "Violences sexuelles",
  [Types[Categorie.VICTIMES].VIOLS]: "Viols",
  [Types[Categorie.VICTIMES].VIOLENCES_PSYCHOLOGIQUES_ET_MORALES]:
    "Violences psychologiques et morales",
  [Types[Categorie.VICTIMES].VIOLENCES_PHYSIQUES]: "Violences physiques",
  [Types[Categorie.VICTIMES].NON_RESPECT_PRESCRIPTION_MEDICALE]:
    "Non respect de la prescription médicale",
  [Types[Categorie.VICTIMES].PRIVATION_DE_DROIT]: "Privation de droit",
  [Types[Categorie.VICTIMES].NEGLIGENCE_GRAVE_OU_ERREURS_SUCCESSIVES]:
    "Négligence grave ou erreurs successives",
  [Types[Categorie.VICTIMES].MALTRAITANCES_NON_PRECISEES]:
    "Maltraitances non précisées",
  [Types[Categorie.VICTIMES].SUICIDE]: "Suicide (suspecté ou avéré)",
  [Types[Categorie.VICTIMES].TENTATIVE_DE_SUICIDE]: "Tentative de suicide",
  [Types[Categorie.VICTIMES].AUTRE]: "Autre, à préciser",
  [Types[Categorie.SANTE].EPIDEMIE]: "Epidémie",
  [Types[Categorie.SANTE].ACCIDENT_CORPOREL]: "Accident corporel (chute, etc…)",
  [Types[Categorie.SANTE].AUTRE]: "Autre, à préciser",
  [Types[Categorie.SECURITE].VOLS]: "Vols",
  [Types[Categorie.SECURITE].FUGUE]: "Fugue",
  [Types[Categorie.SECURITE].ACTES_DE_MALVEILLANCE]: "Actes de malveillance",
  [Types[Categorie.SECURITE].INTOXICATION_ALIMENTAIRE]:
    "Intoxication alimentaire",
  [Types[Categorie.SECURITE].DEPART_DE_FEU]: "Départ de feu",
  [Types[Categorie.SECURITE].INCENDIE]: "Incendie",
  [Types[Categorie.SECURITE].INONDATION]: "Inondation",
  [Types[Categorie.SECURITE].AUTRE]: "Autre, à préciser",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME]
    .PROCEDURES_JUDICIAIRES_CONTRE_LE_PERSONNELS]:
    "Procédures judiciaires à l’encontre de personnels",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].DEFAILLANCE_DE_PERSONNELS]:
    "Défaillance de personnels",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].DEFAILLANCES_TECHNIQUES]:
    "Défaillances techniques",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME]
    .CONFLITS_OU_MENACES_DE_CONFLITS_INTERNES]:
    "Conflits ou menaces de conflits internes",
  [Types[Categorie.FONCTIONNEMENT_ORGANISME].AUTRE]: "Autre, à préciser",
};

module.exports.mapEigToLabel = mapEigToLabel;

module.exports.UpdateTypes = {
  DECLARATION_SEJOUR: "DECLARATION_SEJOUR",
  EMAIL_AUTRES_DESTINATAIRES: "EMAIL_AUTRES_DESTINATAIRES",
  RENSEIGNEMENT_GENERAUX: "RENSEIGNEMENT_GENERAUX",
  TYPE_EVENEMENT: "TYPE_EVENEMENT",
};

module.exports.idDeclarationeligibleToEig = (d) =>
  d.dateDebut <= dayjs().format("YYYY-MM-DD") &&
  dayjs(d.dateFin).add(1, "week").format("YYYY-MM-DD") >=
    dayjs().format("YYYY-MM-DD") &&
  ![
    dsStatuts.statuts.BROUILLON,
    dsStatuts.statuts.ABANDONNEE,
    dsStatuts.statuts.ANNULEE,
  ].includes(d.statut);
