export type UpdateAgrementExpirationRow = {
  id: number;
  mail: string;
};

export type NotifyAgrementExpirationRow = {
  id: number;
  date_fin_validite: date;
  last_mail_expiration_6m_at: date;
  last_mail_expiration_120j_at: date;
  expiration_type: "6m" | "120j";
  mail: string;
  statut: string;
};

export type GenerateEmailParams = {
  mail: string;
  date_fin_validite: date;
};
