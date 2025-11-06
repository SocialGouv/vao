import { AgrementsDto } from "@vao/shared-bridge";
import dayjs from "dayjs";

import AgrementServiceDeprecated from "../../services/Agrement";
import logger from "../../utils/logger";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

export const AgrementService = {
  async getAgrement({
    organismeId,
    withDetails,
  }: {
    organismeId: number;
    withDetails: boolean;
  }) {
    const agrement = await AgrementsRepository.getByOrganismeId({
      organismeId,
      withDetails,
    });

    return agrement;
  },

  async save({ agrement }: { agrement: AgrementsDto }) {
    // Calcul de la date de fin de validité
    const dateFinValidite = agrement?.dateObtentionCertificat
      ? dayjs(agrement.dateObtentionCertificat).add(5, "year").toDate()
      : null;

    if (agrement && agrement?.id) {
      const updatedAgrementId = await AgrementServiceDeprecated.update({
        agrement,
        dateFinValidite,
      });
      log.d("updated meta values - DONE", { updatedAgrementId });
      return updatedAgrementId;
    } else {
      const createdAgrementId = await AgrementsRepository.create({
        agrement,
      });
      log.d("Add meta values - DONE", { createdAgrementId });
      return createdAgrementId;
    }
  },
};
