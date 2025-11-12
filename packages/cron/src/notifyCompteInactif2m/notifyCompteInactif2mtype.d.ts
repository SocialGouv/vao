export type UpdateCompteInactif2mRow = {
  id: number;
  mail: string;
};

export type NotifyCompteInactif2mRow = {
  id: number;
  created_at: datetime;
  lastconnection_at: string;
  mail: string;
  status_code: string;
};

export type GenerateEmailParams = {
  mail: string;
  deadlineDesactivation: string;
};
