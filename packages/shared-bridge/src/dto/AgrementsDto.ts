/* eslint-disable no-unused-vars */
// TODO : Déplacer les énums dans la zone de constantes shared une fois la PR de ach mergée
export enum AgrementStatut {
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

export enum ActiviteType {
  SPORT = "SPORT",
  CULTURE = "CULTURE",
}

export enum TypeHandicap {
  SENSORIEL = "SENSORIEL",
  COGNITIF = "COGNITIF",
  MENTAL_PSYCHIQUE = "MENTAL_PSYCHIQUE",
  MOTEUR = "MOTEUR",
  POLYHANDICAP = "POLYHANDICAP",
}

export enum TrancheAge {
  TA_18_39 = "18_39",
  TA_40_59 = "40_59",
  TA_PLUS_DE_59 = "PLUS_DE_59",
}
export enum FileCategory {
  PROCVERBAL = "AGR_PROCVERBAL",
  MOTIVATION = "AGR_MOTIVATION",
  IMMATRICUL = "AGR_IMMATRICUL",
  ASSURRESP = "AGR_ASSURRESP",
  ASSURRAPAT = "AGR_ASSURRAPAT",
  SEJOUR = "AGR_SEJOUR",
  ACCOMPRESP = "AGR_ACCOMPRESP",
  SUIVIMED = "AGR_SUIVIMED",
  BUDGET = "AGR_BUDGET",
  CHANGEEVOL = "AGR_CHANGEEVOL",
  BILANQUALIT = "AGR_BILANQUALIT",
  BILANFINANC = "AGR_BILANFINANC",
}

export interface AgrementsDto {
  statut: AgrementStatut | null;
  updatedAt: Date | null;
  dateObtentionCertificat: Date | null;
  dateDepot: Date | null;
  dateVerifCompleture: Date | null;
  dateConfirmCompletude: Date | null;
  commentaire: string | null;
  motivations: string | null;
  immatriculation: string | null;
  sejourNbEnvisage: number | null;
  sejourCommentaire: string | null;
  vacanciersNbEnvisage: number | null;
  animationAutre: string | null;
  accompRespNb: number | null;
  accompRespCompExp: string | null;
  accompRespRecruteUrg: string | null;
  accompRespAttestHono: boolean | null;
  transportAllerRetour: string | null;
  transportSejour: string | null;
  suiviMedDistribution: string | null;
  suiviMedAccordSejour: string | null;
  protocoleEvacUrg: string | null;
  protocoleRapatUrg: string | null;
  protocoleRapatEtranger: string | null;
  protocoleMateriel: string | null;
  protocoleInfoFamille: string | null;
  protocoleRemboursement: string | null;
  budgetGestionPerso: string | null;
  budgetPaiementSecurise: string | null;
  budgetComplement: string | null;
  bilanChangementEvolution: boolean | null;
  bilanAucunChangementEvolution: boolean | null;
  bilanQualPerceptionSensibilite: string | null;
  bilanQualPerspectiveEvol: string | null;
  bilanQualElementsMarquants: string | null;
  bilanFinancierComptabilite: string | null;
  bilanFinancierComparatif: string | null;
  bilanFinancierRessourcesHumaines: string | null;
  bilanFinancierCommentaire: string | null;
}

export interface ActiviteDto {
  code: string | null;
  libelle: string | null;
  activiteType: ActiviteType | null;
}

export interface AgrementAnimationDto {
  activiteId: number | null;
  agrementId: number | null;
}

export interface AgrementFilesDto {
  agrementId: number | null;
  category: FileCategory | null;
  fileUuid: string | null;
}

export interface AgrementSejoursDto {
  agrementId: number | null;
  nomHebergement: string | null;
  adresseId: number | null;
  bVacanciers: number | null;
  mois: number[] | null;
}

export interface AgrementBilanAnnuelDto {
  agrementId: number | null;
  annee: number | null;
  nbGlobalVacanciers: number | null;
  nbHommes: number | null;
  nbFemmes: number | null;
  nbTotalJoursVacances: number | null;
  typeHandicap: string[] | null;
  trancheAge: string[] | null;
}

export interface BilanHebergementDto {
  agrBilanAnnuelId: number | null;
  nomHebergement: string | null;
  adresseId: number | null;
  nbJours: number | null;
  mois: number[] | null;
}
