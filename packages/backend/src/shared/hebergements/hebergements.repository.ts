import { UniteHebergementDto } from "@vao/shared-bridge";
import { PoolClient } from "pg";

import { logger } from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import {
  LegacyUniteContextEntity,
  UniteHebergementEntity,
} from "./hebergements.entity";
import { UniteHebergementMapper } from "./hebergements.mapper";

const log = logger(module.filename);

export const HebergementsRepositoryShared = {
  async createUniteHebergement(
    tx: PoolClient,
    {
      accessibilitePmr,
      accessibilitePrecision,
      amenagementsSpecifiques,
      amenagementsSpecifiquesPrecision,
      chambresDoubles,
      couchageIndividuel,
      createdBy,
      editedBy,
      fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite,
      fileReponseExploitantOuProprietaire,
      hebergementId,
      id,
      litsSuperposes,
      nombreChambreTotal,
      nombreCouchageTotal,
      complementLocalisation,
      organismeId,
      rangementIndividuel,
      reglementationErp,
      separationHommeFemme,
      siteId,
      statutId,
      visiteLocaux,
      visiteLocauxAt,
    }: {
      accessibilitePmr: boolean | null;
      accessibilitePrecision: string | null;
      amenagementsSpecifiques: boolean | null;
      amenagementsSpecifiquesPrecision: string | null;
      chambresDoubles: boolean | null;
      couchageIndividuel: boolean | null;
      createdBy: number;
      editedBy: number;
      fileDernierArreteAutorisationMaire: string | null;
      fileDerniereAttestationSecurite: string | null;
      fileReponseExploitantOuProprietaire: string | null;
      hebergementId?: string;
      id?: number;
      litsSuperposes: boolean | null;
      nombreChambreTotal: number | null;
      nombreCouchageTotal: number | null;
      complementLocalisation: string | null;
      organismeId: number;
      rangementIndividuel: boolean | null;
      reglementationErp: boolean | null;
      separationHommeFemme: boolean | null;
      siteId: string;
      statutId: number | null;
      visiteLocaux: boolean | null;
      visiteLocauxAt: Date | null;
    },
  ): Promise<number> {
    log.i("createUniteHebergement - IN");

    const columns: string[] = [
      "site_id",
      "organisme_id",
      "statut_id",
      "created_by",
      "edited_by",
      "nombre_couchage_total",
      "nombre_chambre_total",
      "complement_localisation",
      "lits_superposes",
      "accessibilite_pmr",
      "accessibilite_precision",
      "chambres_doubles",
      "separation_homme_femme",
      "reglementation_erp",
      "couchage_individuel",
      "rangement_individuel",
      "amenagements_specifiques",
      "amenagements_specifiques_precision",
      "file_reponse_exploitant_ou_proprietaire",
      "file_dernier_arrete_autorisation_maire",
      "file_derniere_attestation_securite",
      "visite_locaux",
      "visite_locaux_at",
    ];
    const values: unknown[] = [
      siteId,
      organismeId,
      statutId,
      createdBy,
      editedBy,
      nombreCouchageTotal,
      nombreChambreTotal,
      complementLocalisation,
      litsSuperposes,
      accessibilitePmr,
      accessibilitePrecision,
      chambresDoubles,
      separationHommeFemme,
      reglementationErp,
      couchageIndividuel,
      rangementIndividuel,
      amenagementsSpecifiques,
      amenagementsSpecifiquesPrecision,
      fileReponseExploitantOuProprietaire,
      fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite,
      visiteLocaux,
      visiteLocauxAt,
    ];
    if (id !== undefined) {
      columns.unshift("id");
      values.unshift(id);
    }
    if (hebergementId !== undefined) {
      columns.push("hebergement_id");
      values.push(hebergementId);
    }
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const query = `
      INSERT INTO front.unite_hebergement
        (${columns.join(", ")})
      VALUES (${placeholders})
      RETURNING id;
    `;
    const result = await tx.query(query, values);
    log.i("createUniteHebergement - DONE");
    return result.rows[0].id;
  },

  async getHebergementSiteId(
    hebergementId: number,
    tx?: PoolClient,
  ): Promise<string | null> {
    log.i("getHebergementSiteId - IN");
    const query = `
      SELECT site_id
      FROM front.hebergement
      WHERE id = $1;
    `;
    const result = await (tx ?? getPool()).query(query, [hebergementId]);
    log.i("getHebergementSiteId - DONE");
    return result.rows[0]?.site_id ?? null;
  },

  async getHebergementTypeId(
    tx: PoolClient,
    hebergementTypeValue: string | null,
  ): Promise<number | null> {
    if (!hebergementTypeValue) return null;
    log.i("getHebergementTypeId - IN");
    const query = `
      SELECT id
        FROM front.hebergement_type
      WHERE value = $1
    `;
    const result = await tx.query<{ id: number }>(query, [
      hebergementTypeValue,
    ]);
    log.i("getHebergementTypeId - DONE");
    return result.rows[0]?.id ?? null;
  },

  async getLegacyUniteContext(
    tx: PoolClient,
    hebergementId: number,
  ): Promise<LegacyUniteContextEntity> {
    log.i("getLegacyUniteContext - IN");
    const query = `
      SELECT
        ht.value AS "type",
        htp.value AS "pension",
        h.description_lieu_hebergement AS "descriptionLieuHebergement",
        h.lit_dessus AS "litsDessus",
        COALESCE(
          ARRAY_AGG(hp.value ORDER BY hpt.prestation_id) FILTER (WHERE hp.value IS NOT NULL),
          '{}'
        ) AS "prestationsHotelieres"
      FROM front.hebergement h
      LEFT JOIN front.hebergement_type ht ON ht.id = h.type_id
      LEFT JOIN front.hebergement_type_pension htp ON htp.id = h.type_pension_id
      LEFT JOIN front.hebergement_to_prestations_hotelieres hpt ON hpt.hebergement_id = h.id
      LEFT JOIN front.hebergement_prestations_hotelieres hp ON hp.id = hpt.prestation_id
      WHERE h.id = $1
        AND h.current = TRUE
      GROUP BY h.id, ht.value, htp.value
    `;
    const result = await tx.query<LegacyUniteContextEntity>(query, [
      hebergementId,
    ]);
    log.i("getLegacyUniteContext - DONE");
    return (
      result.rows[0] ?? {
        descriptionLieuHebergement: null,
        litsDessus: null,
        pension: null,
        prestationsHotelieres: [],
        type: null,
      }
    );
  },

  async getStatutId(
    tx: PoolClient,
    statutValue: string,
  ): Promise<number | null> {
    log.i("getStatutId - IN");
    const query = `
      SELECT id
        FROM front.hebergement_statut
      WHERE value = $1
    `;
    const result = await tx.query<{ id: number }>(query, [statutValue]);
    log.i("getStatutId - DONE");
    return result.rows[0]?.id ?? null;
  },

  async getUniteHebergementById(
    uniteHebergementId: number,
    tx?: PoolClient,
  ): Promise<UniteHebergementDto | null> {
    log.i("getUniteHebergementById - IN");
    const query = `
      SELECT
        uh.id, uh.site_id, uh.organisme_id, uh.statut_id, uh.created_at,
        uh.edited_at, uh.hebergement_id, uh."current", uh.created_by, uh.edited_by,
        uh.nombre_couchage_total, uh.nombre_chambre_total, uh.complement_localisation,
        uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at,
        hs.value AS statut,
        (SELECT COALESCE(ARRAY_AGG(hp.value ORDER BY hp.id), ARRAY[]::text[])
           FROM front.unite_hebergement_to_prestations_hotelieres uhprest
           JOIN front.hebergement_prestations_hotelieres hp ON hp.id = uhprest.prestation_id
          WHERE uhprest.unite_hebergement_id = uh.id) AS "prestations_hotelieres",
        (SELECT COALESCE(ARRAY_AGG(htp.value ORDER BY htp.id), ARRAY[]::text[])
           FROM front.unite_hebergement_to_type_pension uhtp
           JOIN front.hebergement_type_pension htp ON htp.id = uhtp.type_pension_id
          WHERE uhtp.unite_hebergement_id = uh.id) AS "type_pensions"
      FROM front.unite_hebergement uh
      LEFT JOIN front.hebergement_statut hs ON hs.id = uh.statut_id
      WHERE uh.id = $1 AND uh."current" IS TRUE;
    `;
    const result = await (tx ?? getPool()).query(query, [uniteHebergementId]);
    log.i("getUniteHebergementById - DONE");
    if (!result.rows?.length) return null;
    const entity = result.rows[0] as UniteHebergementEntity;
    entity.statut = result.rows[0].statut ?? null;
    return UniteHebergementMapper.toModel(entity);
  },

  async getUniteHebergementPrestationsHotelieres(
    uniteHebergementId: number,
    tx?: PoolClient,
  ): Promise<string[]> {
    log.i("getUniteHebergementPrestationsHotelieres - IN");
    const query = `
      SELECT hp.value
      FROM front.unite_hebergement_to_prestations_hotelieres uhprest
      LEFT JOIN front.hebergement_prestations_hotelieres hp ON hp.id = uhprest.prestation_id
      WHERE uhprest.unite_hebergement_id = $1;
    `;
    const result = await (tx ?? getPool()).query(query, [uniteHebergementId]);
    log.i("getUniteHebergementPrestationsHotelieres - DONE");
    return result.rows.map((row) => row.value);
  },

  async getUniteHebergementTypePensions(
    uniteHebergementId: number,
    tx?: PoolClient,
  ): Promise<string[]> {
    log.i("getUniteHebergementTypePensions - IN");
    const query = `
      SELECT hp.value
      FROM front.unite_hebergement_to_type_pension uhtp
      LEFT JOIN front.hebergement_type_pension hp ON hp.id = uhtp.type_pension_id
      WHERE uhtp.unite_hebergement_id = $1;
    `;
    const result = await (tx ?? getPool()).query(query, [uniteHebergementId]);
    log.i("getUniteHebergementTypePensions - DONE");
    return result.rows.map((row) => row.value);
  },

  async getUniteHebergementsByHebergementId(
    hebergementId: string,
  ): Promise<UniteHebergementDto | null> {
    log.i("getUniteHebergementsByHebergementId - IN");
    const query = `
      SELECT
        uh.id, uh.site_id, uh.organisme_id, uh.statut_id, uh.created_at,
        uh.edited_at, uh.hebergement_id, uh."current", uh.created_by, uh.edited_by,
        uh.nombre_couchage_total, uh.nombre_chambre_total, uh.complement_localisation,
        uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at,
        hs.value AS statut,
        (SELECT COALESCE(ARRAY_AGG(hp.value ORDER BY hp.id), ARRAY[]::text[])
           FROM front.unite_hebergement_to_prestations_hotelieres uhprest
           JOIN front.hebergement_prestations_hotelieres hp ON hp.id = uhprest.prestation_id
          WHERE uhprest.unite_hebergement_id = uh.id) AS "prestations_hotelieres",
        (SELECT COALESCE(ARRAY_AGG(htp.value ORDER BY htp.id), ARRAY[]::text[])
           FROM front.unite_hebergement_to_type_pension uhtp
           JOIN front.hebergement_type_pension htp ON htp.id = uhtp.type_pension_id
          WHERE uhtp.unite_hebergement_id = uh.id) AS "type_pensions"
      FROM front.unite_hebergement uh
      LEFT JOIN front.hebergement_statut hs ON hs.id = uh.statut_id
      WHERE uh.hebergement_id = $1 AND uh."current" IS TRUE
      ORDER BY uh.id DESC
      LIMIT 1;
    `;
    const result = await getPool().query(query, [hebergementId]);
    log.i("getUniteHebergementsByHebergementId - DONE");
    if (!result.rows?.length) return null;
    const entity = result.rows[0] as UniteHebergementEntity;
    entity.statut = result.rows[0].statut ?? null;
    return UniteHebergementMapper.toModel(entity);
  },

  async getUniteHebergementsBySiteId(
    siteId: string,
  ): Promise<UniteHebergementDto[]> {
    log.i("getUniteHebergementsBySiteId - IN");
    const query = `
      SELECT
        uh.id, uh.site_id, uh.organisme_id, uh.statut_id, uh.created_at,
        uh.edited_at, uh.hebergement_id, uh."current", uh.created_by, uh.edited_by,
        uh.nombre_couchage_total, uh.nombre_chambre_total, uh.complement_localisation,
        uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at,
        hs.value AS statut,
        (SELECT COALESCE(ARRAY_AGG(hp.value ORDER BY hp.id), ARRAY[]::text[])
           FROM front.unite_hebergement_to_prestations_hotelieres uhprest
           JOIN front.hebergement_prestations_hotelieres hp ON hp.id = uhprest.prestation_id
          WHERE uhprest.unite_hebergement_id = uh.id) AS "prestations_hotelieres",
        (SELECT COALESCE(ARRAY_AGG(htp.value ORDER BY htp.id), ARRAY[]::text[])
           FROM front.unite_hebergement_to_type_pension uhtp
           JOIN front.hebergement_type_pension htp ON htp.id = uhtp.type_pension_id
          WHERE uhtp.unite_hebergement_id = uh.id) AS "type_pensions"
      FROM front.unite_hebergement uh
      LEFT JOIN front.hebergement_statut hs ON hs.id = uh.statut_id
      WHERE uh.site_id = $1 AND uh."current" IS TRUE;
    `;
    const result = await getPool().query(query, [siteId]);
    log.i("getUniteHebergementsBySiteId - DONE");
    return (result.rows as UniteHebergementEntity[]).map((row) => {
      row.statut = row.statut ?? null;
      return UniteHebergementMapper.toModel(row);
    });
  },

  async linkHebergementToSite(
    tx: PoolClient,
    hebergementId: number,
    siteId: string,
  ): Promise<void> {
    log.i("linkHebergementToSite - IN");
    const query = `
      UPDATE front.hebergement
      SET site_id = $2
      WHERE id = $1;
    `;
    await tx.query(query, [hebergementId, siteId]);
    log.i("linkHebergementToSite - DONE");
  },

  async setUniteHebergementPrestationsHotelieres(
    tx: PoolClient,
    uniteHebergementId: number,
    prestationValues: string[],
  ): Promise<void> {
    log.i("setUniteHebergementPrestationsHotelieres - IN");
    await tx.query(
      `DELETE FROM front.unite_hebergement_to_prestations_hotelieres WHERE unite_hebergement_id = $1`,
      [uniteHebergementId],
    );
    if (prestationValues.length > 0) {
      const { rows: prestationIdRows } = await tx.query(
        `SELECT id
           FROM front.hebergement_prestations_hotelieres
          WHERE value = ANY($1)`,
        [prestationValues],
      );
      const prestationIds = prestationIdRows.map((row) => row.id as number);
      if (prestationIds.length > 0) {
        const values = prestationIds
          .map((_, i) => `($1, $${i + 2})`)
          .join(", ");
        await tx.query(
          `INSERT INTO front.unite_hebergement_to_prestations_hotelieres (unite_hebergement_id, prestation_id) VALUES ${values}`,
          [uniteHebergementId, ...prestationIds],
        );
      }
    }
    log.i("setUniteHebergementPrestationsHotelieres - DONE");
  },

  async setUniteHebergementStatut(
    tx: PoolClient,
    uniteHebergementId: number,
    statutId: number,
    editedBy: number,
  ): Promise<void> {
    log.i("setUniteHebergementStatut - IN");
    const query = `
      UPDATE front.unite_hebergement
      SET statut_id = $2, edited_by = $3, edited_at = NOW()
      WHERE id = $1 AND "current" IS TRUE;
    `;
    await tx.query(query, [uniteHebergementId, statutId, editedBy]);
    log.i("setUniteHebergementStatut - DONE");
  },

  async setUniteHebergementTypePensions(
    tx: PoolClient,
    uniteHebergementId: number,
    typePensionValues: string[],
  ): Promise<void> {
    log.i("setUniteHebergementTypePensions - IN");
    await tx.query(
      `DELETE FROM front.unite_hebergement_to_type_pension WHERE unite_hebergement_id = $1`,
      [uniteHebergementId],
    );
    if (typePensionValues.length > 0) {
      const { rows: typePensionIdRows } = await tx.query(
        `SELECT id
           FROM front.hebergement_type_pension
          WHERE value = ANY($1)`,
        [typePensionValues],
      );
      const typePensionIds = typePensionIdRows.map((row) => row.id as number);
      if (typePensionIds.length > 0) {
        const values = typePensionIds
          .map((_, i) => `($1, $${i + 2})`)
          .join(", ");
        await tx.query(
          `INSERT INTO front.unite_hebergement_to_type_pension (unite_hebergement_id, type_pension_id) VALUES ${values}`,
          [uniteHebergementId, ...typePensionIds],
        );
      }
    }
    log.i("setUniteHebergementTypePensions - DONE");
  },

  async unsetUniteHebergementCurrent(
    tx: PoolClient,
    uniteHebergementId: number,
  ): Promise<void> {
    log.i("unsetUniteHebergementCurrent - IN");
    const query = `
      UPDATE front.unite_hebergement
      SET "current" = FALSE
      WHERE id = $1 AND "current" IS TRUE;
    `;
    await tx.query(query, [uniteHebergementId]);
    log.i("unsetUniteHebergementCurrent - DONE");
  },

  async updateUniteHebergement(
    tx: PoolClient,
    uniteHebergementId: number,
    {
      accessibilitePmr,
      accessibilitePrecision,
      amenagementsSpecifiques,
      amenagementsSpecifiquesPrecision,
      chambresDoubles,
      couchageIndividuel,
      editedBy,
      fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite,
      fileReponseExploitantOuProprietaire,
      hebergementId,
      litsSuperposes,
      nombreChambreTotal,
      nombreCouchageTotal,
      complementLocalisation,
      rangementIndividuel,
      reglementationErp,
      separationHommeFemme,
      statutId,
      visiteLocaux,
      visiteLocauxAt,
    }: {
      accessibilitePmr: boolean | null;
      accessibilitePrecision: string | null;
      amenagementsSpecifiques: boolean | null;
      amenagementsSpecifiquesPrecision: string | null;
      chambresDoubles: boolean | null;
      couchageIndividuel: boolean | null;
      editedBy: number;
      fileDernierArreteAutorisationMaire: string | null;
      fileDerniereAttestationSecurite: string | null;
      fileReponseExploitantOuProprietaire: string | null;
      hebergementId?: string;
      litsSuperposes: boolean | null;
      nombreChambreTotal: number | null;
      nombreCouchageTotal: number | null;
      complementLocalisation: string | null;
      rangementIndividuel: boolean | null;
      reglementationErp: boolean | null;
      separationHommeFemme: boolean | null;
      statutId: number | null;
      visiteLocaux: boolean | null;
      visiteLocauxAt: Date | null;
    },
  ): Promise<void> {
    log.i("updateUniteHebergement - IN");
    const updates: Array<{ clause: string; value: unknown }> = [
      { clause: "statut_id", value: statutId },
      { clause: "nombre_couchage_total", value: nombreCouchageTotal },
      { clause: "nombre_chambre_total", value: nombreChambreTotal },
      { clause: "complement_localisation", value: complementLocalisation },
      { clause: "lits_superposes", value: litsSuperposes },
      { clause: "accessibilite_pmr", value: accessibilitePmr },
      { clause: "accessibilite_precision", value: accessibilitePrecision },
      { clause: "chambres_doubles", value: chambresDoubles },
      { clause: "separation_homme_femme", value: separationHommeFemme },
      { clause: "reglementation_erp", value: reglementationErp },
      { clause: "couchage_individuel", value: couchageIndividuel },
      { clause: "rangement_individuel", value: rangementIndividuel },
      { clause: "amenagements_specifiques", value: amenagementsSpecifiques },
      {
        clause: "amenagements_specifiques_precision",
        value: amenagementsSpecifiquesPrecision,
      },
      {
        clause: "file_reponse_exploitant_ou_proprietaire",
        value: fileReponseExploitantOuProprietaire,
      },
      {
        clause: "file_dernier_arrete_autorisation_maire",
        value: fileDernierArreteAutorisationMaire,
      },
      {
        clause: "file_derniere_attestation_securite",
        value: fileDerniereAttestationSecurite,
      },
      { clause: "visite_locaux", value: visiteLocaux },
      { clause: "visite_locaux_at", value: visiteLocauxAt },
      ...(hebergementId
        ? [{ clause: "hebergement_id", value: hebergementId }]
        : []),
    ];
    const setClause = updates
      .map(({ clause }, index) => `${clause} = $${index + 2}`)
      .join(", ");
    const query = `
      UPDATE front.unite_hebergement
      SET ${setClause}, edited_by = $${updates.length + 2}, edited_at = NOW()
      WHERE id = $1 AND "current" IS TRUE;
    `;
    await tx.query(query, [
      uniteHebergementId,
      ...updates.map(({ value }) => value),
      editedBy,
    ]);
    log.i("updateUniteHebergement - DONE");
  },
};
