import { createCron } from "../cron/cron.service";
import { notifySuppressionCompteInactif } from "../config";
import { notifySuppressionCompteInactifActions } from "./notifySuppressionCompteInactif.service";

export const cronNotifySuppressionCompteInactif = () =>
	createCron(
		notifySuppressionCompteInactif.cron,
		notifySuppressionCompteInactif.name,
		notifySuppressionCompteInactifActions,
	);
