import { AgrementDto } from "@vao/shared-bridge";

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

export const getAgrement = async (organismeId: number) => {
  const agrement = await AgrementService.getAgrement({
    organismeId,
    withDetails: true,
  });
  return { agrement };
};
