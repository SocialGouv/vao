/* eslint-disable no-unused-vars */
export enum AGREMENT_STATUT {
  // ACTION 1 : OVA : En cours de rédaction par l'OVA
  BROUILLON = "BROUILLON",
  // ACTION 2 : OVA : OVA a transmis le dossier à la DREETS (Avant prise en charge par la DREETS)
  TRANSMIS = "TRANSMIS",
  // ACTION 3 : DREETS : DREETS prend en charge le dossier
  PRIS_EN_CHARGE = "PRIS_EN_CHARGE", // ???
  // ACTION 4 : OVA : DREETS demande des compléments à l'OVA (Avant la confirmation de complétude)
  A_COMPLETER = "A_COMPLETER",
  // ACTION 5/8 : DREETS : DREETS refuse le dossier
  REFUSE = "REFUSE",
  // ACTION 6 : DREETS : En instruction (Complétude confirmée, SVA en cours)
  EN_INSTRUCTION = "EN_INSTRUCTION",
  // ACTION 7 : A_CORRIGER : DREETS demande des corrections à l'OVA après la confirmation de complétude (Avant la prise de décision finale)
  A_CORRIGER = "A_CORRIGER",
  // ACTION 8 : DREETS valide l'agrément, agrément actif (Statut final)
  VALIDE = "VALIDE",
}
export enum AGREMENT_SVA_TIMER_STATUT {
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
  FINISHED = "FINISHED",
}

const AGREMENT_SVA_TIMER_STATUT_LABELS: Record<
  AGREMENT_SVA_TIMER_STATUT,
  string
> = {
  FINISHED: "Délai dépassé",
  PAUSED: "En attente de pièces complémentaires",
  RUNNING: "Délai en cours",
  STOPPED: "Décision finale prise",
};

export const AGREMENT_SVA_TIMER_STATUT_OPTIONS = Object.values(
  Object.values(AGREMENT_SVA_TIMER_STATUT),
).map((statut) => ({
  text: AGREMENT_SVA_TIMER_STATUT_LABELS[statut],
  value: statut,
}));

const LABELS: Record<AGREMENT_STATUT, string> = {
  A_COMPLETER: "À compléter",
  A_CORRIGER: "À corriger",
  BROUILLON: "Brouillon",
  EN_INSTRUCTION: "Instruction en cours",
  PRIS_EN_CHARGE: "Pris en charge",
  REFUSE: "Refusé",
  TRANSMIS: "Transmis",
  VALIDE: "Validé",
};

export const AGREMENT_STATUT_OPTIONS = Object.values(
  Object.values(AGREMENT_STATUT),
).map((statut) => ({
  text: LABELS[statut],
  value: statut,
}));

export enum ACTIVITE_TYPE {
  SPORT = "SPORT",
  CULTURE = "CULTURE",
}

export enum TYPE_HANDICAP {
  SENSORIEL = "SENSORIEL",
  COGNITIF = "COGNITIF",
  MENTAL_PSYCHIQUE = "MENTAL_PSYCHIQUE",
  MOTEUR = "MOTEUR",
  POLYHANDICAP = "POLYHANDICAP",
}

export enum TRANCHE_AGE {
  TA_18_39 = "18_39",
  TA_40_59 = "40_59",
  TA_PLUS_DE_59 = "PLUS_DE_59",
}

export enum AGREMENT_HISTORY_TYPE {
  STATUT_CHANGE = "STATUT_CHANGE",
  CREATION = "CREATION",
  MODIFICATION = "MODIFICATION",
  VALIDATION = "VALIDATION",
  TRANSMISSION = "TRANSMISSION",
  VERIFICATION = "VERIFICATION",
  PRISE_EN_CHARGE = "PRISE_EN_CHARGE",
}

export const AGREMENT_HISTORY_LABELS: Record<AGREMENT_HISTORY_TYPE, string> = {
  CREATION: "Création de la demande d’agrément",
  MODIFICATION: "Modification de la demande d’agrément",
  PRISE_EN_CHARGE: "Prise en charge de la demande d’agrément",
  STATUT_CHANGE: "Changement de statut de l’agrément",
  TRANSMISSION: "Envoi de la demande de renouvellement d’agrément",
  VALIDATION: "Validation de la demande d’agrément",
  VERIFICATION: "Vérification en cours de la demande d’agrément",
};
