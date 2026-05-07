import type { HebergementDto } from "@vao/shared-bridge";

import Hebergement from "../../services/hebergement/Hebergement";
import { getPool } from "../../utils/pgpool";
import { buildHebergementFixture } from "../fixtures/hebergementFixture";

export const createHebergement = async ({
  userId,
  organismeId,
  declarationId,
  hebergement = {},
}: {
  userId?: number;
  organismeId?: number;
  declarationId?: number;
  hebergement?: Partial<HebergementDto>;
}): Promise<number> => {
  const fixture: Omit<HebergementDto, "id"> = {
    ...buildHebergementFixture(),
    organismeId: organismeId ?? 1,
    statut: "actif",
    ...hebergement,
  };
  const statut = fixture.statut ?? "actif";

  const hebergementId = await Hebergement.create(
    userId ?? 1,
    organismeId ?? 1,
    statut,
    fixture,
  );

  if (declarationId) {
    await getPool().query(
      `INSERT INTO front.demande_sejour_to_hebergement (
        hebergement_id, demande_sejour_id, date_debut, date_fin
      )
      VALUES ($1, $2, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day')`,
      [hebergementId, declarationId],
    );
  }
  return hebergementId;
};
