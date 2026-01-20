import {
  ACTIVITE_TYPE,
  ActiviteDto,
  addYears,
  AgrementDto,
} from "@vao/shared-bridge";

import { getById } from "../../services/adresse";
import { getFileMetaData } from "../../services/Document";
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
    for (const doc of agrement?.agrementFiles || []) {
      const meta = await getFileMetaData(doc.fileUuid);
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
