export type SuppressionCompteInactifRow = {
  id: number;
  mail: string;
  lastconnection_at: string;
  status_code: string;
  nombreDemandes: number;
};

export type SendSuppressionCompteInactifEmailParams = {
  to: string;
};

export type SuppressionCompteInactifReport = {
  total: number;
  suppressionsEffectuees: number;
  emailsEnvoyes: number;
  erreurs: string[];
};
