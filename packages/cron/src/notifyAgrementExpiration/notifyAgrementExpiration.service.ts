import { typeNotification } from "../helpers/notifications";
import * as Sentry from "@sentry/node";
import { notifyAgrementExpiration, sentry } from "../config";
import { insertCron } from "../cron/cron.service";
import {
  sendNotifyAgrementExpiration6m,
  sendNotifyAgrementExpiration120j,
} from "./notifyAgrementExpiration.email";
import { addHistoric } from "../services/Tracking";
import { Actions, Entities, UserTypes } from "../helpers/tracking";
import { logger } from "../utils/logger";
import { Report } from "../utils/report";
import { AgrementExpirationRepository } from "./notifyAgrementExpiration.repository";
export const notifyAgrementExpirationActions = async () => {
  logger.info(`${notifyAgrementExpiration.name} - Start`);
  const startDate = new Date();

  const report: Report = {
    nbUpdate: 0,
    error: 0,
    success: 0,
    total: 0,
    errors: [],
  };

  try {
    const { expiredAggrements } =
      await AgrementExpirationRepository.getExpiredAgrements();
    if (!expiredAggrements || expiredAggrements.length === 0) {
      logger.info("Aucune expiration à notifier");
      return;
    }

    for (const row of expiredAggrements) {
      report.total++;

      try {
        // envoi du mail selon type
        if (row.expiration_type === "6m") {
          await sendNotifyAgrementExpiration6m([row]);
          await AgrementExpirationRepository.updateAgrementExpiration6m(row.id);
        } else {
          await sendNotifyAgrementExpiration120j([row]);
          await AgrementExpirationRepository.updateAgrementExpiration120j(
            row.id,
          );
        }

        // historique
        await addHistoric({
          action: Actions.Notification,
          data: {
            typeNotification:
              row.expiration_type === "6m"
                ? typeNotification.agrementExpiration6m
                : typeNotification.agrementExpiration120j,
            user: row,
          },
          entity: Entities.UserFront,
          entityId: row.id,
          userId: row.id,
          userType: UserTypes.Front,
        });

        report.success++;
        report.nbUpdate++;
      } catch (err) {
        report.error++;
        report.errors.push({ userId: row.id, reason: err });

        logger.error(`Erreur sur utilisateur ${row.id}`, err);
        if (sentry.enabled) Sentry.captureException(err);
      }
    }

    const endDate = new Date();

    await insertCron({
      cronName: notifyAgrementExpiration.name,
      startDate,
      endDate,
      report,
    });

    logger.info(`${notifyAgrementExpiration.name} - End`, report);
  } catch (error) {
    report.error++;
    report.errors.push(error);

    if (sentry.enabled) {
      Sentry.captureException(error);
    }

    logger.error(`${notifyAgrementExpiration.name} - Error`, error);
    throw error;
  }
};
