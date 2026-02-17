import { AgrementDto } from "@vao/shared-bridge";

import { processQuery } from "../../helpers/queryParams";
import { AgrementEntity } from "../../shared/agrements/agrements.entity";
import { AgrementsMapper } from "../../shared/agrements/agrements.mapper";
import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);
// ------------------------------------------------------------
// 🏗️ Repository Admin
// ------------------------------------------------------------
export const AgrementsRepository = {
  /**
   * Récupère une liste d'agréments par région d'obtention
   */
  async getByRegionObtention({
    regionCode,
    criterias,
    queryParams,
  }: {
    regionCode: string;
    criterias: Array<Record<string, any>>;
    queryParams: Record<string, unknown>;
  }): Promise<AgrementDto[] | null> {
    log.i("getByRegionObtention - IN");
    const query = () => `
      SELECT
        agr.*, 
        pm.siret, 
        pm.raison_sociale, 
        pp.prenom, 
        pp.nom_usage, 
        pp.siret
      FROM front.agrements agr
      INNER JOIN front.organismes o ON o.id = agr.organisme_id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = true
      LEFT JOIN front.personne_physique pp ON pp.organisme_id = o.id AND pp.current = true
      WHERE agr.region_obtention = $1
    `;

    const paginatedQuery = processQuery(
      query,
      [regionCode],
      criterias ?? {},
      queryParams,
    );

    const response = await Promise.all([
      getPool().query(paginatedQuery.query, paginatedQuery.params),
      getPool().query(
        paginatedQuery.countQuery,
        paginatedQuery.countQueryParams,
      ),
    ]);
    //const response = await getPool().query(query, [regionCode]);
    if (!response.rows?.length) return null;
    const agrements = [];
    for (const row of response.rows) {
      const agrement = AgrementsMapper.toModel(row as AgrementEntity);
      agrements.push(agrement);
    }
    log.i("getByRegionObtention - DONE");
    return agrements;
  },
};
