import { AgrementDto, OrganismeDto } from "@vao/shared-bridge";

import { getOne as serviceOrganismeGetOne } from "../../services/Organisme";
import logger from "../../utils/logger";
import { mapQueryParams } from "./agrements.queryUtils";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

export const AgrementService = {
  async getListAgrements({
    regionCode,
    queryParams,
  }: {
    regionCode: string;
    queryParams: {
      name?: string;
      numeroAgrement?: string;
      siret?: string;
      statut?: string;
    };
  }): Promise<{
    count: number;
    result: (AgrementDto & { organisme: OrganismeDto })[];
  }> {
    log.i("IN");
    const criterias = [
      {
        key: "pm.siren",
        queryKey: "siren",
        sortEnabled: true,
        type: "default",
      },
      {
        key: "a.statut",
        queryKey: "statut",
        sortEnabled: true,
        type: "default",
      },
      {
        key: '"dateDepot"',
        queryKey: "dateDepot",
        sortEnabled: true,
        sortType: "date",
      },
      {
        query: (index: number, value: string) => {
          return {
            query: `(
                pm.raison_sociale ILIKE '%' || $${index} || '%'
                OR unaccent(pp.prenom) ILIKE '%' || unaccent($${index}) || '%'
                OR unaccent(pp.nom_usage) ILIKE '%' || unaccent($${index}) || '%'
                )`,
            queryParams: [value],
          };
        },
        queryKey: "name",
        sortEnabled: true,
        sortQuery: "pm.raison_sociale, pp.prenom, pp.nom_usage",
        type: "custom",
      },
    ];
    const { count, result: agrements } =
      await AgrementsRepository.getByRegionObtention({
        criterias,
        queryParams: mapQueryParams(queryParams),
        regionCode: String(regionCode),
      });
    if (!agrements || agrements.length === 0) return null;
    const agrementsWithOrganisme = await Promise.all(
      agrements.map(async (agrement) => {
        const organisme = await serviceOrganismeGetOne({
          "o.id": agrement.organismeId,
        });

        return {
          ...agrement,
          organisme,
        };
      }),
    );
    log.i("DONE");
    return { count, result: agrementsWithOrganisme };
  },
};
