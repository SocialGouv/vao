/* eslint-disable no-unused-vars */
export enum AGREMENT_STATUT {
  // ACTION 1 : OVA : En cours de rédaction par l'OVA
  BROUILLON = "BROUILLON",
  // ACTION 2 : OVA : OVA a transmis le dossier à la DREETS (Avant prise en charge par la DREETS)
  TRANSMIS = "TRANSMIS",
  // Obsolete : Ne sera pas utilisé, source de confusion avec le statut "PRIS_EN_CHARGE"
  // ACTION 3 : DREETS : DREETS prend en charge le dossier, en cours d'instruction (Avant complétude du dossier)
  // Va être remplacé par "PRIS_EN_CHARGE" pour plus de clarté
  EN_COURS = "EN_COURS",
  // IMPORTANT
  // Va venir remplacer le statut "EN_COURS" pour indiquer que la DREETS a pris en charge le dossier et que le SVA a démarré
  PRIS_EN_CHARGE = "PRIS_EN_CHARGE", // ???
  // ACTION 4 : OVA : DREETS demande des modifications à l'OVA (Avant la confirmation de complétude)
  // OBSOLETE : Va être remplacé par "A_COMPLETER" pour plus de clarté
  A_MODIFIER = "A_MODIFIER",
  // Va venir remplacer le statut "A_MODIFIER" pour indiquer que la DREETS a demandé des pièces complémentaires à l'OVA, en attente de complétude du dossier
  A_COMPLETER = "A_COMPLETER",
  // ACTION 4 : DREETS : DREETS refuse le dossier (Avant la confirmation de complétude) (Statut final)
  REFUSE = "REFUSE",
  // ACTION 4 : DREETS : DREETS confirme la complétude du dossier, démarre le SVA
  // Le dossier est en cours d'instruction
  COMPLETUDE_CONFIRME = "COMPLETUDE_CONFIRME",
  // NEW : A_CORRIGER : DREETS demande des corrections à l'OVA après la confirmation de complétude (Avant la prise de décision finale)
  A_CORRIGER = "A_CORRIGER", //  ???
  // OBSOLETE : Ne sera pas utilisé
  DEPOSE = "DEPOSE", //  ???
  // OBSOLETE : Ne sera pas utilisé
  VERIF_EN_COURS = "VERIF_EN_COURS", // ???
  // ACTION X : DREETS valide l'agrément, agrément actif (Statut final)
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
  A_MODIFIER: "À modifier",
  BROUILLON: "Brouillon",
  COMPLETUDE_CONFIRME: "Complétude confirmée",
  DEPOSE: "Déposé",
  EN_COURS: "En cours",
  PRIS_EN_CHARGE: "Pris en charge",
  REFUSE: "Refusé",
  TRANSMIS: "Transmis",
  VALIDE: "Validé",
  VERIF_EN_COURS: "Vérification en cours",
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
  EN_COURS = "EN_COURS",
}

export const AGREMENT_HISTORY_LABELS: Record<AGREMENT_HISTORY_TYPE, string> = {
  CREATION: "Création de la demande d’agrément",
  EN_COURS: "Renouvellement de l’agrément en cours",
  MODIFICATION: "Modification de la demande d’agrément",
  PRISE_EN_CHARGE: "Prise en charge de la demande d’agrément",
  STATUT_CHANGE: "Changement de statut de l’agrément",
  TRANSMISSION: "Envoi de la demande de renouvellement d’agrément",
  VALIDATION: "Validation de la demande d’agrément",
  VERIFICATION: "Vérification en cours de la demande d’agrément",
};
