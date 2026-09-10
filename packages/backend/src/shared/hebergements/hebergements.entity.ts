export interface SiteEntity {
  id: number | null;
  site_id: string | null;
  current: boolean | null;
  adresse_id: number | null;
  nom_site_officiel: string | null;
  hebergement_type_id: number | null;
  descriptif: string | null;
  created_at: Date | null;
  edited_at: Date | null;
  created_by: number | null;
  edited_by: number | null;
}

export interface SiteOrganismeEntity {
  site_id: string | null;
  organisme_id: number | null;
  nom_site: string | null;
  resp_nom_prenom: string | null;
  resp_telephone: string | null;
  resp_email: string | null;
  excursion_description: string | null;
  deplacement_proximite_description: string | null;
  vehicules_adaptes: boolean | null;
}

export interface UniteHebergementEntity {
  id: number | null;
  site_id: string | null;
  organisme_id: number | null;
  statut_id: number | null;
  created_at: Date | null;
  edited_at: Date | null;
  hebergement_id: string | null;
  current: boolean | null;
  created_by: number | null;
  edited_by: number | null;
  nombre_couchage_total: number | null;
  lits_superposes: boolean | null;
  accessibilite_pmr: boolean | null;
  accessibilite_precision: string | null;
  chambres_doubles: boolean | null;
  separation_homme_femme: boolean | null;
  reglementation_erp: boolean | null;
  couchage_individuel: boolean | null;
  rangement_individuel: boolean | null;
  amenagements_specifiques: boolean | null;
  amenagements_specifiques_precision: string | null;
  file_reponse_exploitant_ou_proprietaire: string | null;
  file_dernier_arrete_autorisation_maire: string | null;
  file_derniere_attestation_securite: string | null;
  visite_locaux: boolean | null;
  visite_locaux_at: Date | null;
  site?: SiteEntity | null;
  organisme?: object | null;
  statut?: string | null;
  type_pension?: string[] | null;
}

export interface UniteHebergementToTypePensionEntity {
  unite_hebergement_id: number | null;
  type_pension_id: number | null;
}

export interface HebergementWithSiteEntity {
  id: number | null;
  site_id: string | null;
}
