import { type AgrementDto, AGREMENT_TYPE_DEPOT } from "@vao/shared-bridge";

import { AgrementService } from "../../usagers/agrements/agrements.service";

export const createAgrement = async ({
  organismeId = null,
  agrement = {},
  userId = null,
  typeDepot = AGREMENT_TYPE_DEPOT.RENOUVELLEMENT,
}: {
  agrement?: Partial<AgrementDto> | null;
  organismeId?: number | null;
  userId?: string | number | null;
  typeDepot?: AGREMENT_TYPE_DEPOT;
} = {}): Promise<number> => {
  const fixture: AgrementDto = {
    dateObtentionCertificat: new Date("2025-01-01"),
    numero: "IDF-022-2023-02",
    organismeId: organismeId,
    regionObtention: "IDF",
    ...agrement,
  } as unknown as AgrementDto;
  const agrementId = await AgrementService.save(
    { ...fixture, typeDepot },
    userId as string,
  );
  return agrementId;
};

export const updateAgrementRegionObtention = async (
  agrementId: number,
  regionObtention: string | null,
  typeDepot: AGREMENT_TYPE_DEPOT = AGREMENT_TYPE_DEPOT.RENOUVELLEMENT,
) => {
  const agrement = await AgrementService.getById({
    agrementId,
    withDetails: true,
  });
  if (!agrement) {
    throw new Error(`Agrement with id ${agrementId} not found`);
  }
  const updatedAgrement = {
    ...agrement,
    regionObtention,
  };
  await AgrementService.save({ ...updatedAgrement, typeDepot }, "test-user");
};

export const getAgrement = async (agrementId: number) => {
  const agrement = await AgrementService.getById({
    agrementId,
    withDetails: true,
  });
  return { agrement };
};
