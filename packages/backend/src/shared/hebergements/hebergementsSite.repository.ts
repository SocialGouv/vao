import { SiteDto, SiteOrganismeDto } from "@vao/shared-bridge";
import { PoolClient } from "pg";

import { logger } from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import {
  SiteEntity,
  SiteOrganismeEntity,
  SiteWithOrganismeEntity,
} from "./hebergements.entity";
import {
  SiteMapper,
  SiteOrganismeMapper,
  SiteWithOrganismeMapper,
} from "./hebergements.mapper";

const log = logger(module.filename);

export const SitesRepositoryShared = {
  async create(
    tx: PoolClient,
    {
      adresseId,
      createdBy,
      nomSiteOfficiel,
    }: {
      adresseId: number | null;
      createdBy: number | null;
      nomSiteOfficiel: string | null;
    },
  ): Promise<string> {
    log.i("createSite - IN");
    const query = `
      INSERT INTO front.site (adresse_id, nom_site_officiel, created_by)
      VALUES ($1, $2, $3)
      RETURNING site_id;
    `;
    const result = await tx.query(query, [
      adresseId,
      nomSiteOfficiel,
      createdBy,
    ]);
    log.i("createSite - DONE");
    return result.rows[0].site_id;
  },

  async createSiteOrganisme(
    tx: PoolClient,
    {
      deplacementProximiteDescription,
      descriptif,
      excursionDescription,
      hebergementTypeId,
      nomSite,
      organismeId,
      respEmail,
      respNomPrenom,
      respTelephone,
      siteId,
      vehiculesAdaptes,
    }: {
      deplacementProximiteDescription: string | null;
      descriptif: string | null;
      excursionDescription: string | null;
      hebergementTypeId: number | null;
      nomSite: string | null;
      organismeId: number;
      respEmail: string | null;
      respNomPrenom: string | null;
      respTelephone: string | null;
      siteId: string;
      vehiculesAdaptes: boolean | null;
    },
  ): Promise<void> {
    log.i("createSiteOrganisme - IN");
    const query = `
      INSERT INTO front.site_organisme (site_id, organisme_id, nom_site, resp_nom_prenom, resp_telephone, resp_email, hebergement_type_id, descriptif, excursion_description, deplacement_proximite_description, vehicules_adaptes)
      VALUES ($1, $2, left($3, 120), left($4, 120), $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (site_id, organisme_id) DO UPDATE
      SET nom_site = EXCLUDED.nom_site, resp_nom_prenom = EXCLUDED.resp_nom_prenom,
          resp_telephone = EXCLUDED.resp_telephone, resp_email = EXCLUDED.resp_email,
          hebergement_type_id = EXCLUDED.hebergement_type_id,
          descriptif = EXCLUDED.descriptif,
          excursion_description = EXCLUDED.excursion_description,
          deplacement_proximite_description = EXCLUDED.deplacement_proximite_description,
          vehicules_adaptes = EXCLUDED.vehicules_adaptes;
    `;
    await tx.query(query, [
      siteId,
      organismeId,
      nomSite,
      respNomPrenom,
      respTelephone,
      respEmail,
      hebergementTypeId,
      descriptif,
      excursionDescription,
      deplacementProximiteDescription,
      vehiculesAdaptes,
    ]);
    log.i("createSiteOrganisme - DONE");
  },
  async getHebergementTypesBySite(
    siteId: string,
    organismeId: number,
  ): Promise<string[]> {
    log.i("getHebergementTypesBySite - IN");
    const query = `
      SELECT DISTINCT ht.value
      FROM front.site_organisme so
      JOIN front.hebergement_type ht ON ht.id = so.hebergement_type_id
      WHERE so.site_id = $1
        AND so.organisme_id <> $2
        AND so.hebergement_type_id IS NOT NULL;
    `;
    const result = await getPool().query<{ value: string }>(query, [
      siteId,
      organismeId,
    ]);
    log.i("getHebergementTypesBySite - DONE");
    return result.rows.map((row) => row.value);
  },

  async getSiteById(siteId: string): Promise<SiteDto | null> {
    log.i("getSiteById - IN");
    const query = `
      SELECT id, site_id, "current", adresse_id, nom_site_officiel,
             created_at, edited_at, created_by, edited_by
      FROM front.site
      WHERE site_id = $1 AND "current" IS TRUE;
    `;
    const result = await getPool().query(query, [siteId]);
    log.i("getSiteById - DONE");
    if (!result.rows?.length) return null;
    return SiteMapper.toModel(result.rows[0] as SiteEntity);
  },

  async getSiteByIdentifier(id: number): Promise<SiteDto | null> {
    log.i("getSiteByIdentifier - IN");
    const query = `
      SELECT id, site_id, "current", adresse_id, nom_site_officiel,
             created_at, edited_at, created_by, edited_by
      FROM front.site
      WHERE id = $1 AND "current" IS TRUE;
    `;
    const result = await getPool().query(query, [id]);
    log.i("getSiteByIdentifier - DONE");
    if (!result.rows?.length) return null;
    return SiteMapper.toModel(result.rows[0] as SiteEntity);
  },

  async getSiteByNomOfficielAndAdresseLabel(
    tx: PoolClient,
    nomSiteOfficiel: string,
    adresseLabel: string,
  ): Promise<SiteDto | null> {
    log.i("getSiteByNomOfficielAndAdresseLabel - IN");
    const query = `
      SELECT s.id, s.site_id, s."current", s.adresse_id, s.nom_site_officiel,
             s.created_at, s.edited_at, s.created_by, s.edited_by
      FROM front.site s
      JOIN front.adresse a ON a.id = s.adresse_id
      WHERE s."current" IS TRUE
        AND s.nom_site_officiel = $1
        AND a.label = $2
      ORDER BY s.id
      LIMIT 1;
    `;
    const result = await tx.query(query, [nomSiteOfficiel, adresseLabel]);
    log.i("getSiteByNomOfficielAndAdresseLabel - DONE");
    if (!result.rows?.length) return null;
    return SiteMapper.toModel(result.rows[0] as SiteEntity);
  },

  async getSiteOrganisme(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
  ): Promise<SiteOrganismeDto | null> {
    log.i("getSiteOrganisme - IN");
    const query = `
      SELECT site_id, organisme_id, nom_site, resp_nom_prenom,
             resp_telephone, resp_email, hebergement_type_id, descriptif,
             excursion_description, deplacement_proximite_description,
             vehicules_adaptes
      FROM front.site_organisme
      WHERE site_id = $1 AND organisme_id = $2;
    `;
    const result = await tx.query(query, [siteId, organismeId]);
    log.i("getSiteOrganisme - DONE");
    if (!result.rows?.length) return null;
    return SiteOrganismeMapper.toModel(result.rows[0] as SiteOrganismeEntity);
  },

  async getSiteWithOrganisme(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
  ): Promise<ReturnType<typeof SiteWithOrganismeMapper.toModel> | null> {
    log.i("getSiteWithOrganisme - IN");
    const query = `
      SELECT s.id, s.site_id, s."current", s.adresse_id, s.nom_site_officiel,
             s.created_at, s.edited_at, s.created_by, s.edited_by,
             ht.value AS hebergement_type_value,
             so.organisme_id, so.nom_site, so.resp_nom_prenom,
             so.resp_telephone, so.resp_email, so.hebergement_type_id,
             so.descriptif, so.excursion_description,
             so.deplacement_proximite_description, so.vehicules_adaptes
      FROM front.site s
      LEFT JOIN front.site_organisme so
        ON so.site_id = s.site_id AND so.organisme_id = $2
      LEFT JOIN front.hebergement_type ht
        ON ht.id = so.hebergement_type_id
      WHERE s.site_id = $1 AND s."current" IS TRUE;
    `;
    const result = await tx.query(query, [siteId, organismeId]);
    log.i("getSiteWithOrganisme - DONE");
    if (!result.rows?.length) return null;
    return SiteWithOrganismeMapper.toModel(
      result.rows[0] as SiteWithOrganismeEntity,
    );
  },

  async getSitesByOrganismeId(organismeId: number): Promise<SiteDto[]> {
    log.i("getSitesByOrganismeId - IN");
    const query = `
      SELECT s.id, s.site_id, s."current", s.adresse_id, s.nom_site_officiel,
             s.created_at, s.edited_at, s.created_by, s.edited_by
      FROM front.site s
      INNER JOIN front.site_organisme so ON so.site_id = s.site_id
      WHERE so.organisme_id = $1 AND s."current" IS TRUE;
    `;
    const result = await getPool().query(query, [organismeId]);
    log.i("getSitesByOrganismeId - DONE");
    return SiteMapper.toModels(result.rows as SiteEntity[]);
  },

  async unsetSiteCurrent(tx: PoolClient, siteId: string): Promise<void> {
    log.i("unsetSiteCurrent - IN");
    const query = `
      UPDATE front.site
      SET "current" = FALSE
      WHERE site_id = $1 AND "current" IS TRUE;
    `;
    await tx.query(query, [siteId]);
    log.i("unsetSiteCurrent - DONE");
  },

  async update(
    tx: PoolClient,
    siteId: string,
    {
      adresseId,
      editedBy,
      nomSiteOfficiel,
    }: {
      adresseId: number | null;
      editedBy: number | null;
      nomSiteOfficiel: string | null;
    },
  ): Promise<void> {
    log.i("updateSite - IN");
    const query = `
      UPDATE front.site
      SET adresse_id = $2, nom_site_officiel = $3, edited_by = $4, edited_at = NOW()
      WHERE site_id = $1 AND "current" IS TRUE;
    `;
    await tx.query(query, [siteId, adresseId, nomSiteOfficiel, editedBy]);
    log.i("updateSite - DONE");
  },

  async updateOrganismeResp(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
    {
      respEmail,
      respNomPrenom,
      respTelephone,
    }: {
      respEmail: string | null;
      respNomPrenom: string | null;
      respTelephone: string | null;
    },
  ): Promise<void> {
    log.i("updateOrganismeResp - IN");
    const query = `
      UPDATE front.site_organisme
      SET resp_email = $1, resp_nom_prenom = $2, resp_telephone = $3
      WHERE site_id = $4 AND organisme_id = $5;
    `;
    await tx.query(query, [
      respEmail,
      respNomPrenom,
      respTelephone,
      siteId,
      organismeId,
    ]);
    log.i("updateOrganismeResp - DONE");
  },

  async updateSiteInformation(
    tx: PoolClient,
    siteId: string,
    organismeId: number,
    {
      descriptif,
      hebergementTypeId,
    }: {
      descriptif: string | null;
      hebergementTypeId: number | null;
    },
  ): Promise<void> {
    log.i("updateSiteInformation - IN");
    const query = `
      UPDATE front.site_organisme
      SET hebergement_type_id = $3, descriptif = $4
      WHERE site_id = $1 AND organisme_id = $2;
    `;
    await tx.query(query, [siteId, organismeId, hebergementTypeId, descriptif]);
    log.i("updateSiteInformation - DONE");
  },
};
