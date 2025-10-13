
export type SuppressionCompteInactifReport = {
	total: number;
	avecDemande: number;
	sansDemande: number;
	alertesEnvoyees: number;
	rappelsEnvoyes: number;
	suppressionsEffectuees: number;
	annulations: number;
	erreurs: string[];
};

export type NotifySuppressionCompteInactifRow = {
	id: number;
	mail: string;
	lastconnection_at: string;
	status_code: string;
	nombreDemandes: number;
	last_mail_inactivity_5m_at: string | null;
	last_mail_inactivity_5m_reminder_at: string | null;
	planned_deletion_at: string | null;
};

export type NotifyCompteInactif2mEmailType = "ALERTE_5M" | "RAPPEL_J7";

export type NotifyCompteInactif2mEmailParams = {
	mail: string;
	dateSuppression: string | Date;
	type: NotifyCompteInactif2mEmailType;
};
