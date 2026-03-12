import {
  ACTIVITE_TYPE,
  ActiviteDto,
  addYears,
  AGREMENT_HISTORY_TYPE,
  AGREMENT_STATUT,
  AgrementDto,
} from "@vao/shared-bridge";

import { getById } from "../../services/adresse";
import { getFileMetaData } from "../../services/Document";
import { mailService } from "../../services/mail";
import AppError from "../../utils/error";
import logger from "../../utils/logger";
import MailUtils from "../../utils/mail";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

export const AgrementService = {
  async get({
    agrementId,
    withDetails,
  }: {
    agrementId: number;
    withDetails: boolean;
  }): Promise<AgrementDto | null> {
    const agrement = await AgrementsRepository.getById({
      agrementId,
      withDetails,
    });
    for (const doc of agrement?.agrementFiles || []) {
      const meta = await getFileMetaData(doc.fileUuid!);
      Object.assign(doc, meta);
    }
    for (const bilanAnnuel of agrement?.agrementBilanAnnuel || []) {
      for (const bilanHebergement of bilanAnnuel.bilanHebergement || []) {
        const adresse = await getById(bilanHebergement.adresse.id);
        bilanHebergement.adresse = adresse;
      }
    }
    for (const sejours of agrement?.agrementSejours || []) {
      const adresse = await getById(sejours.adresse.id);
      sejours.adresse = adresse;
    }
    return agrement;
  },
  async getAllActivites(): Promise<ActiviteDto[]> {
    const activites = await AgrementsRepository.getAllActivites();
    return activites.map((activite) => ({
      activiteType: activite.activite_type as ACTIVITE_TYPE,
      code: activite.code,
      id: activite.id,
      libelle: activite.libelle,
    }));
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

    await AgrementService.trackEvent({
      agrementId,
      source: "usager",
      type: AGREMENT_HISTORY_TYPE.STATUT_CHANGE,
      typePrecision: statut,
      usagerUserId: Number(usagerUserId),
    });

    if (statut === AGREMENT_STATUT.TRANSMIS) {
      const email = await AgrementsRepository.getUserMail(agrementId);
      if (email) {
        try {
          await mailService.send(
            MailUtils.usagers.agrement.sendStatutTransmisMail({ email }),
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
