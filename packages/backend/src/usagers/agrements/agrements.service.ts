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

  async save({
    organismeId,
    numero,
    regionObtention,
    dateObtention,
    file,
  }: {
    organismeId: number;
    numero: string;
    regionObtention: string;
    dateObtention: Date;
    file: object;
  }) {
    const agrement = await AgrementsRepository.getByOrganismeId({
      organismeId,
      withDetails: false,
    });
    const dateFinValidite = dayjs(dateObtention).add(5, "year").toDate();

    if (agrement && agrement?.id) {
      const updatedAgrementId = await AgrementServiceDeprecated.update(
        organismeId,
        numero,
        regionObtention,
        dateObtention,
        dateFinValidite,
        file,
      );
      log.d("updated meta values - DONE", { updatedAgrementId });
      return updatedAgrementId;
    } else {
      const createdAgrementId = await AgrementServiceDeprecated.create(
        organismeId,
        numero,
        regionObtention,
        dateObtention,
        dateFinValidite,
        file,
      );
      log.d("Add meta values - DONE", { createdAgrementId });
      return createdAgrementId;
    }
  },
};
