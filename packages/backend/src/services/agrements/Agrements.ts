import { AgrementsDto } from "../../dto/AgrementsDto";
import { AgrementsRepository } from "../../repositories/usagers/Agrements";

export default async function getByOrganismeId({
  organismeId,
}: {
  organismeId: number;
}) {
  const { agrement }: { agrement: AgrementsDto } =
    await AgrementsRepository.getByOrganismeId({
      organismeId,
    });

  return { agrement };
}
