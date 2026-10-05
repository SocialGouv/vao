import type { SiteDto, SiteListeDto } from "@vao/shared-bridge";

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

  async getSitesList({
    organismeIds,
    statut,
    nom,
    adresse,
    limit,
    offset,
    sortBy,
    sortDirection,
  }: {
    adresse?: string;
    limit: number;
    nom?: string;
    offset: number;
    organismeIds: number[];
    sortBy?: string;
    sortDirection?: string;
    statut?: string;
  }): Promise<{ rows: SiteListeDto[]; total: number }> {
    log.i("getSitesList - IN");

    const sortColumns: Record<string, string> = {
      adresse: "a.label",
      departement: "a.departement",
      nom: "COALESCE(s.nom_site_officiel, so.nom_site)",
      statut: "hs.value",
    };

    const params: unknown[] = [organismeIds];
    const clauses: string[] = [
      `uh."current" IS TRUE`,
      `s."current" IS TRUE`,
      `so.organisme_id = ANY($1::int[])`,
    ];

    if (statut) {
      params.push(statut);
      clauses.push(`hs.value = $${params.length}`);
    }

    const nomFilter = nom?.trim();
    if (nomFilter) {
      params.push(nomFilter);
      clauses.push(
        `COALESCE(s.nom_site_officiel, so.nom_site) ILIKE '%' || $${params.length} || '%'`,
      );
    }

    const adresseFilter = adresse?.trim();
    if (adresseFilter) {
      params.push(adresseFilter);
      clauses.push(`a.label ILIKE '%' || $${params.length} || '%'`);
    }

    const where = clauses.join(" AND ");

    const fromJoin = `
      FROM front.unite_hebergement uh
      JOIN front.site s ON s.site_id = uh.site_id
      JOIN front.site_organisme so ON so.site_id = s.site_id
      LEFT JOIN front.hebergement_statut hs ON hs.id = uh.statut_id
      LEFT JOIN front.adresse a ON a.id = s.adresse_id
      LEFT JOIN front.hebergement_type ht ON ht.id = s.hebergement_type_id
    `;

    const selectQuery = `
      SELECT
        uh.id AS "id",
        s.site_id AS "siteId",
        COALESCE(s.nom_site_officiel, so.nom_site) AS "nom",
        a.label AS "adresse",
        a.departement AS "departement",
        ht.value AS "type",
        hs.value AS "statut",
        so.organisme_id AS "organismeId"
      ${fromJoin}
      WHERE ${where}
    `;

    const sortColumn = sortBy ? sortColumns[sortBy] : undefined;
    const direction = sortDirection === "DESC" ? "DESC" : "ASC";
    const orderBy = sortColumn
      ? ` ORDER BY ${sortColumn} ${direction}`
      : ` ORDER BY s.id DESC`;

    const limitParamIndex = params.length + 1;
    const offsetParamIndex = params.length + 2;

    const countQuery = `
      SELECT COUNT(*)::INT AS "total"
      ${fromJoin}
      WHERE ${where}
    `;

    const [rowsResult, countResult] = await Promise.all([
      getPool().query(
        `${selectQuery}${orderBy} LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex}`,
        [...params, limit, offset],
      ),
      getPool().query(countQuery, params),
    ]);

    const rows = rowsResult.rows as unknown as SiteListeDto[];
    const total = (countResult.rows[0]?.total as number) ?? 0;

    log.i("getSitesList - DONE");
    return { rows, total };
  },
};
