import type { SiteDto } from "@vao/shared-bridge";

import { SiteEntity } from "../../shared/hebergements/hebergements.entity";
import { SiteMapper } from "../../shared/hebergements/hebergements.mapper";
import { logger } from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = logger(module.filename);

export const HebergementsRepository = {
  async findSiteSimilaritesCandidates({
    adresse,
    nomSiteOfficiel,
  }: {
    adresse: { label: string; codePostal: string };
    nomSiteOfficiel: string;
  }): Promise<SiteDto[]> {
    log.i("findSiteSimilaritesCandidates - IN");

    const labelFilter = adresse.label?.trim() ?? "";
    const nomSiteOfficielFilter = nomSiteOfficiel?.trim() ?? "";

    const params: string[] = [];
    const clauses: string[] = [];

    const codePostalParamIndex = params.push(adresse.codePostal);

    if (labelFilter) {
      const labelParamIndex = params.push(labelFilter);
      clauses.push(`
        (
          similarity(a.label, $${labelParamIndex}) >= 0.6
          OR a.label ilike '%' || $${labelParamIndex} || '%'
        )
      `);
    }

    if (nomSiteOfficielFilter) {
      const nomParamIndex = params.push(nomSiteOfficielFilter);
      clauses.push(`
        (
          s.nom_site_officiel ilike '%' || $${nomParamIndex} || '%'
          OR similarity(s.nom_site_officiel, $${nomParamIndex}) >= 0.6
        )
      `);
    }

    let query = `
      SELECT DISTINCT s.id, s.site_id, s."current", s.adresse_id, s.nom_site_officiel,
             s.created_at, s.edited_at, s.created_by, s.edited_by
      FROM front.site s
      LEFT JOIN front.adresse a ON a.id = s.adresse_id
      WHERE s."current" IS TRUE
      AND a.code_postal = $${codePostalParamIndex}
    `;

    if (clauses.length > 0) {
      query += `AND (${clauses.join(" OR ")})`;
    }

    query += ";";

    const result = await getPool().query(query, params);
    log.i("findSiteSimilaritesCandidates - DONE");

    return SiteMapper.toModels(result.rows as SiteEntity[]);
  },
};
