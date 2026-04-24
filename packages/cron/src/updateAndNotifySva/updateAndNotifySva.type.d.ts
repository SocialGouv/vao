export type UpdateAndNotifySvaRow = {
  id: number;
  jours_cumules: number;
  jours_max: number;
  jours_restants: number;
  date_fin_previsionnelle: Date;
  date_confirm_completude: Date;
  date_depot: Date;
  agrement_id: number;
  to_notify: boolean;
  to_passed_finished: boolean;
  region_obtention: string;
  organisme_id: number;
  organisme_nom: string;
  organisme_adresse: string;
};

export type SendUpdateAndNotifySvaEmailParams = {
  to: string;
};

export type UpdateAndNotifySvaReport = {
  total: number;
  error: number;
  miseAJourEffectuees: number;
  emailsEnvoyes: number;
  errors: string[];
};
