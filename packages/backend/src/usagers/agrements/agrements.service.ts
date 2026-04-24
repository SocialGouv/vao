import type {
  ActiviteDto,
  AgrementDto,
  AgrementMessage,
} from "@vao/shared-bridge";
import {
  addYears,
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AGREMENT_SVA_TIMER_STATUT,
} from "@vao/shared-bridge";

import { mailService } from "../../services/mail";
import { AgrementsRepositoryShared } from "../../shared/agrements/agrements.repository";
import { AgrementServiceShared } from "../../shared/agrements/agrements.service";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import { AgrementMailUsagers } from "./agrements.mail";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

export const AgrementService = {
  async getAllActivites(): Promise<ActiviteDto[]> {
    return await AgrementServiceShared.getAllActivites();
  },
  async getById({
    agrementId,
    withDetails,
  }: {
    agrementId: number;
    withDetails: boolean;
  }) {
    return await AgrementServiceShared.getById({ agrementId, withDetails });
  },
  async getHistory(agrementId: number) {
    const history = await AgrementsRepository.getHistory(agrementId);
    return history;
  },
  async getList({
    userId,
    statut,
  }: {
    userId: number;
    statut?: string | null;
  }): Promise<AgrementDto[] | []> {
    const agrements = await AgrementsRepository.getList({
      statut,
      userId,
    });
    return agrements;
  },
  async getMessages(
    agrementId: number,
  ): Promise<{ messages: AgrementMessage[]; unreadCount: number }> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }
    return await AgrementsRepository.getMessages(agrementId);
  },
  async markMessagesAsRead(agrementId: number): Promise<number> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }

    return await AgrementsRepository.markMessagesAsRead(agrementId);
  },
  async postMessage({
    agrementId,
    userId,
    message,
  }: {
    agrementId: number;
    userId: number;
    message: string;
  }): Promise<void> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }

    const inserted = await AgrementsRepository.insertMessage({
      agrementId,
      message,
      userId,
    });

    if (!inserted) {
      log.w("Échec de l'insertion du message", { agrementId, userId });
      throw new AppError("Échec de l'insertion du message", {
        statusCode: 500,
      });
    }
  },
  async save(agrement: AgrementDto): Promise<number> {
    agrement.dateFinValidite = addYears(agrement?.dateObtention, 5);
    let agrementId = null;

    if (agrement && agrement?.id) {
      agrementId = await AgrementsRepository.update({
        agrement,
      });
      log.d("updated meta values - DONE", { agrementId });
    } else {
      agrementId = await AgrementsRepository.create({
        agrement,
      });
      log.d("Add meta values - DONE", { agrementId });
    }
    return agrementId;
  },
  async trackEvent(event: {
    source: string;
    agrementId: number;
    usagerUserId: number;
    type?: AGREMENT_HISTORY_TYPE | null;
    typePrecision?: string | null;
    metadata?: Record<string, unknown> | null;
  }) {
    return AgrementsRepository.insertHistoryEvent(event);
  },
  async updateStatut({
    agrementId,
    statut,
    usagerUserId,
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
    usagerUserId: string;
  }): Promise<boolean> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails: false,
    });
    if (!agrement) {
      log.w("Agrement non trouvé", agrementId);
      throw new AppError("Agrement non trouvé", { statusCode: 404 });
    }
    const client = await getPool().connect();

    try {
      client.query("BEGIN");
      const updated = await AgrementsRepository.updateStatut({
        agrementId,
        client,
        statut,
      });
      if (!updated) {
        throw new AppError("Échec de la mise à jour du statut", {
          statusCode: 500,
        });
      }
      await AgrementService.updateSvaTimer({
        agrementId,
        client,
        statut,
      });
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      log.w("Erreur lors de la mise à jour du statut", { agrementId, error });
      throw error;
    } finally {
      client.release();
    }

    let eventType: AGREMENT_HISTORY_TYPE;
    if (statut === AGREMENT_STATUT.TRANSMIS) {
      eventType = AGREMENT_HISTORY_TYPE.TRANSMISSION;
    } else if (statut === AGREMENT_STATUT.DEPOSE) {
      eventType = AGREMENT_HISTORY_TYPE.MODIFICATION;
    } else {
      eventType = AGREMENT_HISTORY_TYPE.STATUT_CHANGE;
    }

    await AgrementService.trackEvent({
      agrementId,
      source: "usager",
      type: eventType,
      typePrecision: statut,
      usagerUserId: Number(usagerUserId),
    });

    if (statut === AGREMENT_STATUT.TRANSMIS) {
      const email = await AgrementsRepository.getUserMail(agrementId);
      if (email) {
        try {
          await mailService.send(
            AgrementMailUsagers.sendStatutTransmisMail({ email }),
          );
        } catch (e) {
          log.w("Erreur lors de l'envoi de l'email de transmission", e);
        }
      } else {
        log.w("Aucun email trouvé pour l'agrément", agrementId);
      }
    }
    return true;
  },
  async updateSvaTimer({
    agrementId,
    client,
    statut,
  }: {
    agrementId: number;
    client: any;
    statut: AGREMENT_STATUT;
  }): Promise<void> {
    // Côté OVA, lorsque l'utilisateur fait le retour, alors on redéclenche le SVA.
    // - changement de statut du timer en RUNNING
    // - Nouvelle période
    if (statut === AGREMENT_STATUT.COMPLETUDE_CONFIRME) {
      const timerId = await AgrementsRepositoryShared.updateSvaTimer({
        agrementId,
        client,
        statut: AGREMENT_SVA_TIMER_STATUT.RUNNING,
      });
      if (!timerId) {
        throw new AppError("SVA Timer non trouvé pour l'agrément", {
          statusCode: 500,
        });
      }
      // On redémarre une nouvelle période
      await AgrementsRepositoryShared.insertSvaPeriode({
        client,
        timerId,
      });
    }
  },
};
