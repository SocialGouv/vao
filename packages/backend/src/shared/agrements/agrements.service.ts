import { getById } from "../../services/adresse";
import { getFileMetaData } from "../../services/Document";
import { AgrementsRepositoryShared } from "./agrements.repository";

export const AgrementServiceShared = {
  async getById({
    agrementId,
    withDetails,
  }: {
    agrementId: number;
    withDetails: boolean;
  }) {
    const agrement = await AgrementsRepositoryShared.getById({
      agrementId,
      withDetails,
    });
    if (!agrement) return null;
    if (withDetails) {
      await Promise.all(
        (agrement.agrementFiles ?? []).map(async (doc) => {
          const meta = await getFileMetaData(doc.fileUuid!);
          Object.assign(doc, meta);
        }),
      );
      await Promise.all(
        (agrement.agrementBilanAnnuel ?? []).flatMap((bilanAnnuel) =>
          (bilanAnnuel.bilanHebergement ?? []).map(async (bh) => {
            if (bh.adresse?.id) {
              bh.adresse = await getById(bh.adresse.id);
            }
          }),
        ),
      );
      await Promise.all(
        (agrement.agrementSejours ?? []).map(async (sejour) => {
          if (sejour.adresse?.id) {
            sejour.adresse = await getById(sejour.adresse.id);
          }
        }),
      );
    }
    return agrement;
  },
};
