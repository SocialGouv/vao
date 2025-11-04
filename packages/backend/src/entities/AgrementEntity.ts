/**
 * Database row type with snake_case columns for Agrement
 */
export interface AgrementEntity {
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
}
