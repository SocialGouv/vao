import type { AgrementDto } from "@vao/shared-bridge";

import { AgrementService as AgrementServiceShared } from "../../../shared/agrements/agrements.service";
import { AgrementService } from "../../../usagers/agrements/agrements.service";

export const createAgrement = async ({
  organismeId = null,
  agrement = {},
}: {
  agrement?: Partial<AgrementDto> | null;
  organismeId?: number | null;
} = {}): Promise<number> => {
  const fixture: AgrementDto = {
    dateObtentionCertificat: new Date("2025-01-01"),
    numero: "IDF-022-2023-02",
    organismeId: organismeId,
    regionObtention: "IDF",
    ...agrement,
  } as unknown as AgrementDto;
  const agrementId = await AgrementService.save(fixture);
  return agrementId;
};

export const getAgrement = async (agrementId: number) => {
  const agrement = await AgrementServiceShared.getById({
    agrementId,
    withDetails: true,
  });
  return { agrement };
};
