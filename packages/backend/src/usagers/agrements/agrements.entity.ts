import { AdresseDto } from "@vao/shared-bridge";

/**
 * Database row type with snake_case columns for Agrement
 */
export interface AgrementEntity {
  id: number | null;
  organisme_id: number | null;
  statut: string | null;
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
  activite: ActiviteEntity[] | null;
  agrement_animation: AgrementAnimationEntity[] | null;
  agrement_file: AgrementFilesEntity[] | null;
  agrement_sejour: AgrementSejoursEntity[] | null;
  agrement_bilan_annuel: AgrementBilanAnnuelEntity[] | null;
}

/**
 * Database row type with snake_case columns for Activite
 */
export interface ActiviteEntity {
  id: number | null;
  code: string | null;
  libelle: string | null;
  activite_type: string | null;
}

/**
 * Database row type with snake_case columns for AgrementAnimation
 */
export interface AgrementAnimationEntity {
  id?: number | null;
  activite_id: number | null;
  agrement_id: number | null;
  activite?: ActiviteEntity;
}

/**
 * Database row type with snake_case columns for AgrementFiles
 */
export interface AgrementFilesEntity {
  id?: number | null;
  agrement_id: number | null;
  category: string | null;
  file_uuid: string | null;
}

/**
 * Database row type with snake_case columns for AgrementSejours
 */
export interface AgrementSejoursEntity {
  id?: number | null;
  agrement_id: number | null;
  adresse_id: number | null;
  adresse: AdresseDto | null;
  nom_hebergement: string | null;
  nb_vacanciers: number | null;
  mois: number[] | null;
}

/**
 * Database row type with snake_case columns for AgrementBilanAnnuel
 */
export interface AgrementBilanAnnuelEntity {
  id?: number | null;
  agrement_id: number | null;
  annee: number | null;
  nb_global_vacanciers: number | null;
  nb_hommes: number | null;
  nb_femmes: number | null;
  nb_total_jours_vacances: number | null;
  type_handicap: string[] | null;
  tranche_age: string[] | null;
  bilan_hebergement: BilanHebergementEntity[] | null;
}

/**
 * Database row type with snake_case columns for BilanHebergement
 */
export interface BilanHebergementEntity {
  id?: number | null;
  adresse: AdresseDto | null;
  agr_bilan_annuel_id?: number | null;
  nom_hebergement: string | null;
  adresse_id: number | null;
  nb_jours: number | null;
  mois: number[] | null;
}
