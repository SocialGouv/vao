import type {
  ActiviteDto,
  AgrementDto,
  AgrementMessage,
} from "@vao/shared-bridge";
import {
  addYears,
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
} from "@vao/shared-bridge";

import { AgrementMailAdmin } from "../../admin/agrements/agrements.mail";
import Region from "../../services/geo/Region";
import { mailService } from "../../services/mail";
import Organisme from "../../services/Organisme";
import TerritoireService from "../../services/Territoire";
import { AgrementServiceShared } from "../../shared/agrements/agrements.service";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import { AgrementMailUsagers } from "./agrements.mail";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

async function getEmailRegion(codeRegion: string): Promise<string | null> {
  try {
    const fiche = await TerritoireService.readFicheIdByTerCode(codeRegion);
    if (!fiche?.id) return null;
    const ficheTerritoire = await TerritoireService.readOne(fiche.id);
    return ficheTerritoire?.service_mail || null;
  } catch (e) {
    log.w(
      "Erreur lors de la récupération de l'email de la région",
      codeRegion,
      e,
    );
    return null;
  }
}

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

    const updated = await AgrementsRepository.updateStatut({
      agrementId,
      statut,
    });
    if (!updated) {
      throw new AppError("Échec de la mise à jour du statut", {
        statusCode: 500,
      });
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
      const date = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      let organismeName = "";
      let siret = "";
      let nomObtentionRegion = null;
      let emailRegion: string | null = null;

      try {
        const organisme = await Organisme.getOne({
          "o.id": agrement.organismeId,
        });
        if (
          organisme.typeOrganisme === "personne_morale" &&
          organisme.personneMorale
        ) {
          organismeName = organisme.personneMorale.raisonSociale || "";
          siret = organisme.personneMorale.siret || "";
        } else if (
          organisme.typeOrganisme === "personne_physique" &&
          organisme.personnePhysique
        ) {
          organismeName =
            organisme.personnePhysique.nomUsage?.trim() ||
            organisme.personnePhysique.nomNaissance ||
            "";
          siret = organisme.personnePhysique.siret || "";
        }

        const codeObtentionRegion = agrement.regionObtention || null;
        if (codeObtentionRegion) {
          const region = await Region.fetchOne(codeObtentionRegion);
          nomObtentionRegion = region.text;
          emailRegion = await getEmailRegion(codeObtentionRegion);
        }
        if (!organisme) {
          log.w(`Organisme introuvable pour agrementId=${agrementId}`);
        } else if (!codeObtentionRegion) {
          log.w(
            `Région introuvable pour codeObtentionRegion=${codeObtentionRegion}`,
          );
        } else if (!emailRegion) {
          log.w(
            `Email de région manquant pour codeObtentionRegion=${codeObtentionRegion}`,
          );
        }
      } catch (e) {
        log.w(
          "Impossible d'envoyer l'email à la région : informations manquantes ou erreur lors de la récupération. AgrementId=" +
            agrementId,
          e,
        );
      }

      if (emailRegion) {
        try {
          await mailService.send(
            AgrementMailAdmin.sendStatutTransmisRegionMail({
              agrementId,
              date,
              email: emailRegion,
              organismeName,
              siret,
            }),
          );
        } catch (e) {
          log.w("Erreur lors de l'envoi de l'email à la région", e);
        }
      }

      if (email) {
        try {
          await mailService.send(
            AgrementMailUsagers.sendStatutTransmisMail({
              date,
              email,
              regionDreets: nomObtentionRegion,
            }),
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
};
