import { addYears, AgrementDto } from "@vao/shared-bridge";

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
  }): Promise<AgrementDto | null> {
    const agrement = await AgrementsRepository.getByOrganismeId({
      organismeId,
      withDetails,
    });
    return agrement;
  },

  async save(agrement: AgrementDto): Promise<number> {
    const dateFinValidite = addYears(agrement?.dateObtentionCertificat, 5);
    let agrementId = null;

    if (agrement && agrement?.id) {
      agrementId = await AgrementsRepository.update({
        agrement,
        dateFinValidite,
      });
      log.d("updated meta values - DONE", { agrementId });
    } else {
      agrementId = await AgrementsRepository.create({
        agrement,
        dateFinValidite,
      });
      log.d("Add meta values - DONE", { agrementId });
    }
    return agrementId;
  },
};
