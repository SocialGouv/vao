import type { AgrementDto } from "@vao/shared-bridge";

import { AgrementsRepository } from "../../repositories/usagers/Agrements";

export default async function getByOrganismeId({
  organismeId,
}: {
  organismeId: number;
}) {
  const { agrement }: { agrement: AgrementDto } =
    await AgrementsRepository.getByOrganismeId({
      organismeId,
    });

  return { agrement };
}
