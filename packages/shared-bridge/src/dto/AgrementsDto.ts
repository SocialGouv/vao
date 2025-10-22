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
  updated_at: Date | null;
  date_obtention_certificat: Date | null;
  date_depot: Date | null;
  date_verif_completure: Date | null;
  date_confirm_completude: Date | null;
  commentaire: string | null;
  motivations: string | null;
  immatriculation: string | null;
  sejour_nb_envisage: number | null;
  sejour_commentaire: string | null;
  vacanciers_nb_envisage: number | null;
  animation_autre: string | null;
  accomp_resp_nb: number | null;
  accomp_resp_comp_exp: string | null;
  accomp_resp_recrute_urg: string | null;
  accomp_resp_attest_hono: boolean | null;
  transport_aller_retour: string | null;
  transport_sejour: string | null;
  suivi_med_distribution: string | null;
  suivi_med_accord_sejour: string | null;
  protocole_evac_urg: string | null;
  protocole_rapat_urg: string | null;
  protocole_rapat_etranger: string | null;
  protocole_materiel: string | null;
  protocole_info_famille: string | null;
  protocole_remboursement: string | null;
  budget_gestion_perso: string | null;
  budget_paiement_securise: string | null;
  budget_complement: string | null;
  bilan_changement_evolution: boolean | null;
  bilan_aucun_changement_evolution: boolean | null;
  bilan_qual_perception_sensibilite: string | null;
  bilan_qual_perspective_evol: string | null;
  bilan_qual_elements_marquants: string | null;
  bilan_financier_comptabilite: string | null;
  bilan_financier_comparatif: string | null;
  bilan_financier_ressources_humaines: string | null;
  bilan_financier_commentaire: string | null;
}

export interface ActiviteDto {
  code: string | null;
  libelle: string | null;
  activite_type: ActiviteType | null;
}

export interface AgrementAnimationDto {
  activite_id: number | null;
  agrement_id: number | null;
}

export interface AgrementFilesDto {
  agrement_id: number | null;
  category: FileCategory | null;
  file_uuid: string | null;
}

export interface AgrementSejoursDto {
  agrement_id: number | null;
  nom_hebergement: string | null;
  adresse_id: number | null;
  b_vacanciers: number | null;
  mois: number[] | null;
}

export interface AgrementBilanAnnuelDto {
  agrement_id: number | null;
  annee: number | null;
  nb_global_vacanciers: number | null;
  nb_hommes: number | null;
  nb_femmes: number | null;
  nb_total_jours_vacances: number | null;
  type_handicap: string[] | null;
  tranche_age: string[] | null;
}

export interface BilanHebergementDto {
  agr_bilan_annuel_id: number | null;
  nom_hebergement: string | null;
  adresse_id: number | null;
  nb_jours: number | null;
  mois: number[] | null;
}
