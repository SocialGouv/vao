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
import {
  addYears,
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
} from "@vao/shared-bridge";

/**
 * Envoi des notifications liées à l'accord tacite
 */
const sendTaciteNotifications = async (
  svaToNotify: any,
  ficheTerritoire: any,
) => {
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

  const userListMail = await OrganismesServiceShared.getListMailByOrganismesId({
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
};

/**
 * Gestion des SVA à passer en "finished"
 */
const handlePassedFinished = async (
  svaToNotify: any,
  ficheTerritoire: any,
  report: UpdateAndNotifySvaReport,
) => {
  const client = await pool.connect();
  let committed = false;

  try {
    await client.query("BEGIN");

    await UpdateAndNotifySvaRepository.updateStatutSva({
      id: svaToNotify.id,
      client,
    });

    await UpdateAndNotifySvaRepository.desactiverAgrement({
      organismeId: svaToNotify.organisme_id,
      client,
    });

    await UpdateAndNotifySvaRepository.updateStatutAgrement({
      id: svaToNotify.agrement_id,
      statut: AGREMENT_STATUT.VALIDE,
      dateObtention: new Date(),
      dateFinValidite: addYears(new Date(), 5),
      client,
    });

    await UpdateAndNotifySvaRepository.insertHistoryEvent({
      agrementId: svaToNotify.agrement_id,
      source: "Automate VAO- Accord Tacite",
      type: AGREMENT_HISTORY_TYPE.STATUT_CHANGE,
      typePrecision: `${AGREMENT_STATUT.VALIDE} par accord tacite suite à la fin du SVA`,
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

    await sendTaciteNotifications(svaToNotify, ficheTerritoire);

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
};

/**
 * Gestion des notifications simples (21 jours)
 */
const handleNotify = async (
  svaToNotify: any,
  ficheTerritoire: any,
  report: UpdateAndNotifySvaReport,
) => {
  await UpdateAndNotifySvaRepository.updateMailNotificationSva({
    id: svaToNotify.id,
  });

  try {
    MailSva.bo.sendNotificationDelay21Days({
      to: ficheTerritoire.service_mail,
      svaToNotify,
    });
  } catch (emailErr) {
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
  }

  report.emailsEnvoyes += 1;
};

/**
 * Fonction principale
 */
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
      await handlePassedFinished(svaToNotify, ficheTerritoire, report);
      continue;
    }

    if (!svaToNotify.to_notify) {
      continue;
    }

    await handleNotify(svaToNotify, ficheTerritoire, report);
  }

  await insertCron({
    cronName: "updateAndNotifySva",
    startDate,
    endDate: new Date(),
    report,
  });

  logger.info("updateAndNotifySvaActions - End");
};
