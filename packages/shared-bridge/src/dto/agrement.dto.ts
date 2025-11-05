import { ACTIVITE_TYPE, AGREMENT_STATUT } from "../constantes/agrement";
import { FILE_CATEGORY } from "../constantes/file";

export interface AgrementsDto {
  id?: number | null;
  statut: AGREMENT_STATUT | null;
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
  agrementAnimation?: AgrementAnimationDto[];
  agrementFiles?: AgrementFilesDto[];
  agrementSejours?: AgrementSejoursDto[];
  agrementBilanAnnuel?: AgrementBilanAnnuelDto[];
}

export interface ActiviteDto {
  code: string | null;
  libelle: string | null;
  activiteType: ACTIVITE_TYPE | null;
}

export interface AgrementAnimationDto {
  activiteId: number | null;
  agrementId: number | null;
  activite: ActiviteDto;
}

export interface AgrementFilesDto {
  agrementId: number | null;
  category: FILE_CATEGORY | null;
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
  bilanHebergement: BilanHebergementDto | null;
}

export interface BilanHebergementDto {
  agrBilanAnnuelId: number | null;
  nomHebergement: string | null;
  adresseId: number | null;
  nbJours: number | null;
  mois: number[] | null;
}
