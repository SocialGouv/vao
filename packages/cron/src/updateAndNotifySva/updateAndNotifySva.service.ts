import { MailSva } from "./updateAndNotifySva.email";
import { insertCron } from "../cron/cron.service";
import { logger } from "../utils/logger";
import { UpdateAndNotifySvaRepository } from "./updateAndNotifySva.repository";
import { UpdateAndNotifySvaReport } from "./updateAndNotifySva.type";
import { TerritoireServiceShared } from "../shared/territoires/territoire.service";
import { OrganismesServiceShared } from "../shared/organismes/organismes.service";
import { addHistoric } from "../services/Tracking";
import { pool } from "../db";
import { Actions, Entities, UserTypes } from "../helpers/tracking";
import * as Sentry from "@sentry/node";
import { sentry } from "../config";

export const updateAndNotifySvaActions = async () => {
  logger.info("updateAndNotifySvaActions - Start");
  const startDate = new Date();
  const report: UpdateAndNotifySvaReport = {
    total: 0,
    error: 0,
    miseAJourEffectuees: 0,
    emailsEnvoyes: 0,
    errors: [],
  };

  const rows = await UpdateAndNotifySvaRepository.selectSvaToNotify();
  report.total = rows.length;
  logger.info(`SVA à notifier: ${rows.length}`);
  for (const svaToNotify of rows) {
    const ficheTerritoire = await TerritoireServiceShared.getByTerCode({
      terCode: svaToNotify.region_obtention,
    });
    if (svaToNotify.to_passed_finished) {
      const client = await pool.connect();
      let committed = false;
      try {
        await client.query("BEGIN");
        // On passe le statut du SVA à "finished"
        await UpdateAndNotifySvaRepository.updateStatutSva({
          id: svaToNotify.id,
          client,
        });
        // On passe l'agrément à "Validé"
        await UpdateAndNotifySvaRepository.updateStatutAgrement({
          id: svaToNotify.agrement_id,
          client,
        });

        await client.query("COMMIT");
        committed = true;

        await addHistoric({
          action: Actions.Modification,
          data: { reason: "Accord Tacite de l'agrément" },
          entity: Entities.Agrements,
          entityId: svaToNotify.agrement_id,
          userId: 0,
          userType: UserTypes.Cron,
        });

        MailSva.bo.sendNotificationSvaTacite({
          to: ficheTerritoire.service_mail,
          svaToNotify,
        });
        await addHistoric({
          action: Actions.Notification,
          data: {
            reason: `Notification Accord Tacite de l'agrément (SVA) à ${ficheTerritoire.service_mail}`,
          },
          entity: Entities.Agrements,
          entityId: svaToNotify.agrement_id,
          userId: 0,
          userType: UserTypes.Cron,
        });

        const userListMail =
          await OrganismesServiceShared.getListMailByOrganismesId({
            id: svaToNotify.organisme_id,
          });

        const mailsOVA = userListMail.map((u: { mail: string }) => u.mail);

        MailSva.ova.sendNotificationSvaTacite({
          to: mailsOVA,
          territoire: ficheTerritoire,
          svaToNotify,
        });
        await addHistoric({
          action: Actions.Notification,
          data: {
            reason: `Notification Accord Tacite de l'agrément (SVA) à l'OVA : ${mailsOVA}`,
          },
          entity: Entities.Agrements,
          entityId: svaToNotify.agrement_id,
          userId: 0,
          userType: UserTypes.Cron,
        });

        report.miseAJourEffectuees += 1;
      } catch (error) {
        if (!committed) {
          await client.query("ROLLBACK");
        }
        const erreurText = `Erreur lors de la mise à jour du statut du SVA avec l'id ${svaToNotify.id} : ${error}`;

        report.errors.push(erreurText);
        report.error++;
        logger.error(erreurText);
      } finally {
        await client.release();
      }
      continue;
    }

    if (!svaToNotify.to_notify) {
      continue;
    }

    await UpdateAndNotifySvaRepository.updateMailNotificationSva({
      id: svaToNotify.id,
    });
    try {
      MailSva.bo.sendNotificationDelay21Days({
        to: ficheTerritoire.service_mail,
        svaToNotify,
      });
    } catch (emailErr) {
      // rollback si mail fails
      await UpdateAndNotifySvaRepository.updateMailNotificationSvaRollback({
        id: svaToNotify.id,
      });
      report.error++;
      const erreurText = `Erreur lors de l'envoie de l'email à ${ficheTerritoire?.service_mail}, sendNotificationDelay21Days pour l'agrément ${svaToNotify?.agrement_id}`;
      report.errors.push(erreurText);
      logger.error(erreurText, emailErr);
      if (sentry && sentry.enabled) {
        Sentry.captureException(emailErr);
      }
      throw emailErr;
    }

    report.emailsEnvoyes += 1;
  }

  const endDate = new Date();
  await insertCron({
    cronName: "updateAndNotifySva",
    startDate,
    endDate,
    report,
  });
  logger.info("updateAndNotifySvaActions - End");
};
