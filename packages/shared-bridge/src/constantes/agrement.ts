/* eslint-disable no-unused-vars */
export enum AGREMENT_STATUT {
  BROUILLON = "BROUILLON",
  TRANSMIS = "TRANSMIS",
  DEPOSE = "DEPOSE",
  VERIF_EN_COURS = "VERIF_EN_COURS",
  PRIS_EN_CHARGE = "PRIS_EN_CHARGE",
  EN_COURS = "EN_COURS",
  A_MODIFIER = "A_MODIFIER",
  REFUSE = "REFUSE",
  COMPLETUDE_CONFIRME = "COMPLETUDE_CONFIRME",
  VALIDE = "VALIDE",
}

const LABELS: Record<AGREMENT_STATUT, string> = {
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
export interface AgrementHistoryUser {
  id: number;
  nom: string;
  prenom: string;
  mail: string;
}

export interface AgrementHistoryItem {
  id: number;
  source: string;
  agrement_id: number;
  usager_user?: AgrementHistoryUser | null;
  bo_user?: AgrementHistoryUser | null;
  type?: string | null;
  type_precision?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: Date;
}

export interface AgrementHistoryRow {
  id: number;
  source: string;
  agrement_id: number;
  usager_user_id?: number | null;
  usager_nom?: string | null;
  usager_prenom?: string | null;
  usager_mail?: string | null;
  bo_user_id?: number | null;
  bo_nom?: string | null;
  bo_prenom?: string | null;
  bo_mail?: string | null;
  type?: string | null;
  type_precision?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: Date;
}
