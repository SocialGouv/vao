import { AgrementDto, OrganismeDto } from "@vao/shared-bridge";

import { getOne as serviceOrganismeGetOne } from "../../services/Organisme";
import logger from "../../utils/logger";
import type { QueryParamsSearch } from "./agrements.queryUtils";
import { mapQueryParams } from "./agrements.queryUtils";
import { AgrementsRepository } from "./agrements.repository";

const log = logger(module.filename);

export const AgrementService = {
  async getListAgrements({
    regionCode,
    queryParams,
  }: {
    regionCode: string;
    queryParams: QueryParamsSearch;
  }): Promise<{
    count: number;
    result: (AgrementDto & { organisme: OrganismeDto })[];
  }> {
    log.i("IN");
    const criterias = [
      {
        query: (index: number, value: string) => {
          return {
            query: `
            (
              (pm.siret ILIKE '%' || $${index} || '%')
                OR
              (pp.siret ILIKE '%' || $${index} || '%')
            )
          `,
            queryParams: [value],
          };
        },
        queryKey: "siret",
        sortEnabled: true,
        sortQuery: "COALESCE(pm.siret, pp.siret)",
        sortType: "custom",
        type: "custom",
      },
      {
        key: "agr.statut",
        queryKey: "statut",
        sortEnabled: true,
        type: "default",
      },
      {
        key: "date_depot",
        queryKey: "dateDepot",
        sortEnabled: true,
        sortType: "date",
      },
      {
        key: "agr.numero",
        queryKey: "numero",
        sortEnabled: true,
        type: "default",
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
        sortQuery: "coalesce(pm.raison_sociale, pp.nom_usage)",
        sortType: "custom",
        type: "custom",
      },
    ];
    const { count, result: agrements } =
      await AgrementsRepository.getByRegionObtention({
        criterias,
        queryParams: mapQueryParams(queryParams),
        regionCode: String(regionCode),
      });
    if (!agrements || agrements.length === 0) return { count: 0, result: [] };
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
