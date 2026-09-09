import {
  SiteDto,
  SiteOrganismeDto,
  UniteHebergementDto,
} from "@vao/shared-bridge";
import { PoolClient } from "pg";

import { logger } from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import {
  SiteEntity,
  SiteOrganismeEntity,
  UniteHebergementEntity,
} from "./hebergements.entity";
import {
  SiteMapper,
  SiteOrganismeMapper,
  UniteHebergementMapper,
} from "./hebergements.mapper";

const log = logger(module.filename);

export const HebergementsRepositoryShared = {
  async createSite(
    tx: PoolClient,
    {
      adresseId,
      createdBy,
      descriptif,
      hebergementTypeId,
      nomSiteOfficiel,
    }: {
      adresseId: number | null;
      createdBy: number;
      descriptif: string | null;
      hebergementTypeId: number | null;
      nomSiteOfficiel: string | null;
    },
  ): Promise<string> {
    log.i("createSite - IN");
    const query = `
      INSERT INTO front.site (adresse_id, nom_site_officiel, hebergement_type_id, descriptif, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING site_id;
    `;
    const result = await tx.query(query, [
      adresseId,
      nomSiteOfficiel,
      hebergementTypeId,
      descriptif,
      createdBy,
    ]);
    log.i("createSite - DONE");
    return result.rows[0].site_id;
  },

  async createSiteOrganisme(
    tx: PoolClient,
    {
      nomSite,
      organismeId,
      respEmail,
      respNomPrenom,
      respTelephone,
      siteId,
    }: {
      nomSite: string | null;
      organismeId: number;
      respEmail: string | null;
      respNomPrenom: string | null;
      respTelephone: string | null;
      siteId: string;
    },
  ): Promise<void> {
    log.i("createSiteOrganisme - IN");
    const query = `
      INSERT INTO front.site_organisme (site_id, organisme_id, nom_site, resp_nom_prenom, resp_telephone, resp_email)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (site_id, organisme_id) DO UPDATE
      SET nom_site = EXCLUDED.nom_site, resp_nom_prenom = EXCLUDED.resp_nom_prenom,
          resp_telephone = EXCLUDED.resp_telephone, resp_email = EXCLUDED.resp_email;
    `;
    await tx.query(query, [
      siteId,
      organismeId,
      nomSite,
      respNomPrenom,
      respTelephone,
      respEmail,
    ]);
    log.i("createSiteOrganisme - DONE");
  },

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
      deplacementProximiteDescription,
      editedBy,
      excursionDescription,
      fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite,
      fileReponseExploitantOuProprietaire,
      hebergementId,
      id,
      litsSuperposes,
      nombreCouchageTotal,
      organismeId,
      rangementIndividuel,
      reglementationErp,
      separationHommeFemme,
      siteId,
      statutId,
      vehiculesAdaptes,
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
      deplacementProximiteDescription: string | null;
      editedBy: number;
      excursionDescription: string | null;
      fileDernierArreteAutorisationMaire: string | null;
      fileDerniereAttestationSecurite: string | null;
      fileReponseExploitantOuProprietaire: string | null;
      hebergementId: string;
      id: number;
      litsSuperposes: boolean | null;
      nombreCouchageTotal: number | null;
      organismeId: number;
      rangementIndividuel: boolean | null;
      reglementationErp: boolean | null;
      separationHommeFemme: boolean | null;
      siteId: string;
      statutId: number | null;
      vehiculesAdaptes: boolean | null;
      visiteLocaux: boolean | null;
      visiteLocauxAt: Date | null;
    },
  ): Promise<number> {
    log.i("createUniteHebergement - IN");
    const query = `
      INSERT INTO front.unite_hebergement
        (id, site_id, organisme_id, statut_id, created_by, edited_by,
         hebergement_id, nombre_couchage_total, lits_superposes,
         accessibilite_pmr, accessibilite_precision, chambres_doubles,
         separation_homme_femme, reglementation_erp, couchage_individuel,
         rangement_individuel, amenagements_specifiques,
         amenagements_specifiques_precision, excursion_description,
         file_reponse_exploitant_ou_proprietaire,
         file_dernier_arrete_autorisation_maire,
         file_derniere_attestation_securite, visite_locaux, visite_locaux_at,
         deplacement_proximite_description, vehicules_adaptes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
              $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      RETURNING id;
    `;
    const result = await tx.query(query, [
      id,
      siteId,
      organismeId,
      statutId,
      createdBy,
      editedBy,
      hebergementId,
      nombreCouchageTotal,
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
      excursionDescription,
      fileReponseExploitantOuProprietaire,
      fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite,
      visiteLocaux,
      visiteLocauxAt,
      deplacementProximiteDescription,
      vehiculesAdaptes,
    ]);
    log.i("createUniteHebergement - DONE");
    return result.rows[0].id;
  },

  async getHebergementSiteId(hebergementId: number): Promise<string | null> {
    log.i("getHebergementSiteId - IN");
    const query = `
      SELECT site_id
      FROM front.hebergement
      WHERE id = $1;
    `;
    const result = await getPool().query(query, [hebergementId]);
    log.i("getHebergementSiteId - DONE");
    return result.rows[0]?.site_id ?? null;
  },

  async getSiteById(siteId: string): Promise<SiteDto | null> {
    log.i("getSiteById - IN");
    const query = `
      SELECT id, site_id, "current", adresse_id, nom_site_officiel,
             hebergement_type_id, descriptif, created_at, edited_at,
             created_by, edited_by
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
             hebergement_type_id, descriptif, created_at, edited_at,
             created_by, edited_by
      FROM front.site
      WHERE id = $1 AND "current" IS TRUE;
    `;
    const result = await getPool().query(query, [id]);
    log.i("getSiteByIdentifier - DONE");
    if (!result.rows?.length) return null;
    return SiteMapper.toModel(result.rows[0] as SiteEntity);
  },

  async getSiteOrganisme(
    siteId: string,
    organismeId: number,
  ): Promise<SiteOrganismeDto | null> {
    log.i("getSiteOrganisme - IN");
    const query = `
      SELECT site_id, organisme_id, nom_site, resp_nom_prenom,
             resp_telephone, resp_email
      FROM front.site_organisme
      WHERE site_id = $1 AND organisme_id = $2;
    `;
    const result = await getPool().query(query, [siteId, organismeId]);
    log.i("getSiteOrganisme - DONE");
    if (!result.rows?.length) return null;
    return SiteOrganismeMapper.toModel(result.rows[0] as SiteOrganismeEntity);
  },

  async getSitesByOrganismeId(organismeId: number): Promise<SiteDto[]> {
    log.i("getSitesByOrganismeId - IN");
    const query = `
      SELECT s.id, s.site_id, s."current", s.adresse_id, s.nom_site_officiel,
             s.hebergement_type_id, s.descriptif, s.created_at, s.edited_at,
             s.created_by, s.edited_by
      FROM front.site s
      INNER JOIN front.site_organisme so ON so.site_id = s.site_id
      WHERE so.organisme_id = $1 AND s."current" IS TRUE;
    `;
    const result = await getPool().query(query, [organismeId]);
    log.i("getSitesByOrganismeId - DONE");
    return SiteMapper.toModels(result.rows as SiteEntity[]);
  },

  async getUniteHebergementByHebergementId(
    hebergementId: string,
  ): Promise<UniteHebergementDto | null> {
    log.i("getUniteHebergementByHebergementId - IN");
    const query = `
      SELECT
        uh.id, uh.site_id, uh.organisme_id, uh.statut_id, uh.created_at,
        uh.edited_at, uh.hebergement_id, uh."current", uh.created_by, uh.edited_by,
        uh.nombre_couchage_total, uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.excursion_description, uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at, uh.deplacement_proximite_description,
        uh.vehicules_adaptes,
        hs.value AS statut
      FROM front.unite_hebergement uh
      LEFT JOIN front.hebergement_statut hs ON hs.id = uh.statut_id
      WHERE uh.hebergement_id = $1 AND uh."current" IS TRUE;
    `;
    const result = await getPool().query(query, [hebergementId]);
    log.i("getUniteHebergementByHebergementId - DONE");
    if (!result.rows?.length) return null;
    const entity = result.rows[0] as UniteHebergementEntity;
    entity.statut = result.rows[0].statut ?? null;
    return UniteHebergementMapper.toModel(entity);
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
        uh.nombre_couchage_total, uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.excursion_description, uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at, uh.deplacement_proximite_description,
        uh.vehicules_adaptes,
        hs.value AS statut
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

  async getUniteHebergementTypePensions(
    uniteHebergementId: number,
  ): Promise<string[]> {
    log.i("getUniteHebergementTypePensions - IN");
    const query = `
      SELECT hp.value
      FROM front.unite_hebergement_to_type_pension uhtp
      LEFT JOIN front.hebergement_type_pension hp ON hp.id = uhtp.type_pension_id
      WHERE uhtp.unite_hebergement_id = $1;
    `;
    const result = await getPool().query(query, [uniteHebergementId]);
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
        uh.nombre_couchage_total, uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.excursion_description, uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at, uh.deplacement_proximite_description,
        uh.vehicules_adaptes,
        hs.value AS statut
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

  async getUniteHebergementsById(
    hebergementId: string,
  ): Promise<UniteHebergementDto | null> {
    log.i("getUniteHebergementsById - IN");
    const query = `
      SELECT
        uh.id, uh.site_id, uh.organisme_id, uh.statut_id, uh.created_at,
        uh.edited_at, uh.hebergement_id, uh."current", uh.created_by, uh.edited_by,
        uh.nombre_couchage_total, uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.excursion_description, uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at, uh.deplacement_proximite_description,
        uh.vehicules_adaptes,
        hs.value AS statut
      FROM front.unite_hebergement uh
      LEFT JOIN front.hebergement_statut hs ON hs.id = uh.statut_id
      WHERE uh.id = $1
      ORDER BY uh.id DESC
      LIMIT 1;
    `;
    const result = await getPool().query(query, [hebergementId]);
    log.i("getUniteHebergementsById - DONE");
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
        uh.nombre_couchage_total, uh.lits_superposes, uh.accessibilite_pmr,
        uh.accessibilite_precision, uh.chambres_doubles, uh.separation_homme_femme,
        uh.reglementation_erp, uh.couchage_individuel, uh.rangement_individuel,
        uh.amenagements_specifiques, uh.amenagements_specifiques_precision,
        uh.excursion_description, uh.file_reponse_exploitant_ou_proprietaire,
        uh.file_dernier_arrete_autorisation_maire, uh.file_derniere_attestation_securite,
        uh.visite_locaux, uh.visite_locaux_at, uh.deplacement_proximite_description,
        uh.vehicules_adaptes,
        hs.value AS statut
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

  async setSiteCurrent(tx: PoolClient, siteId: string): Promise<void> {
    log.i("setSiteCurrent - IN");
    const query = `
      UPDATE front.site
      SET "current" = FALSE
      WHERE site_id = $1;
    `;
    await tx.query(query, [siteId]);
    log.i("setSiteCurrent - DONE");
  },

  async setUniteHebergementCurrent(
    tx: PoolClient,
    uniteHebergementId: number,
  ): Promise<void> {
    log.i("setUniteHebergementCurrent - IN");
    const query = `
      UPDATE front.unite_hebergement
      SET "current" = FALSE
      WHERE id = $1;
    `;
    await tx.query(query, [uniteHebergementId]);
    log.i("setUniteHebergementCurrent - DONE");
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

  async updateSite(
    tx: PoolClient,
    siteId: string,
    {
      adresseId,
      descriptif,
      editedBy,
      hebergementTypeId,
      nomSiteOfficiel,
    }: {
      adresseId: number | null;
      descriptif: string | null;
      editedBy: number;
      hebergementTypeId: number | null;
      nomSiteOfficiel: string | null;
    },
  ): Promise<void> {
    log.i("updateSite - IN");
    const query = `
      UPDATE front.site
      SET adresse_id = $2, nom_site_officiel = $3, hebergement_type_id = $4,
          descriptif = $5, edited_by = $6, edited_at = NOW()
      WHERE site_id = $1 AND "current" IS TRUE;
    `;
    await tx.query(query, [
      siteId,
      adresseId,
      nomSiteOfficiel,
      hebergementTypeId,
      descriptif,
      editedBy,
    ]);
    log.i("updateSite - DONE");
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
      deplacementProximiteDescription,
      editedBy,
      excursionDescription,
      fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite,
      fileReponseExploitantOuProprietaire,
      hebergementId,
      litsSuperposes,
      nombreCouchageTotal,
      rangementIndividuel,
      reglementationErp,
      separationHommeFemme,
      statutId,
      vehiculesAdaptes,
      visiteLocaux,
      visiteLocauxAt,
    }: {
      accessibilitePmr: boolean | null;
      accessibilitePrecision: string | null;
      amenagementsSpecifiques: boolean | null;
      amenagementsSpecifiquesPrecision: string | null;
      chambresDoubles: boolean | null;
      couchageIndividuel: boolean | null;
      deplacementProximiteDescription: string | null;
      editedBy: number;
      excursionDescription: string | null;
      fileDernierArreteAutorisationMaire: string | null;
      fileDerniereAttestationSecurite: string | null;
      fileReponseExploitantOuProprietaire: string | null;
      hebergementId?: string;
      litsSuperposes: boolean | null;
      nombreCouchageTotal: number | null;
      rangementIndividuel: boolean | null;
      reglementationErp: boolean | null;
      separationHommeFemme: boolean | null;
      statutId: number | null;
      vehiculesAdaptes: boolean | null;
      visiteLocaux: boolean | null;
      visiteLocauxAt: Date | null;
    },
  ): Promise<void> {
    log.i("updateUniteHebergement - IN");
    const hebergementIdClause = hebergementId ? `, hebergement_id = $23` : "";
    const query = `
      UPDATE front.unite_hebergement
      SET statut_id = $2, nombre_couchage_total = $3, lits_superposes = $4,
          accessibilite_pmr = $5, accessibilite_precision = $6,
          chambres_doubles = $7, separation_homme_femme = $8,
          reglementation_erp = $9, couchage_individuel = $10,
          rangement_individuel = $11, amenagements_specifiques = $12,
          amenagements_specifiques_precision = $13, excursion_description = $14,
          file_reponse_exploitant_ou_proprietaire = $15,
          file_dernier_arrete_autorisation_maire = $16,
          file_derniere_attestation_securite = $17, visite_locaux = $18,
          visite_locaux_at = $19, deplacement_proximite_description = $20,
          vehicules_adaptes = $21, edited_by = $22, edited_at = NOW()
          ${hebergementIdClause}
      WHERE id = $1 AND "current" IS TRUE;
    `;
    await tx.query(query, [
      uniteHebergementId,
      statutId,
      nombreCouchageTotal,
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
      excursionDescription,
      fileReponseExploitantOuProprietaire,
      fileDernierArreteAutorisationMaire,
      fileDerniereAttestationSecurite,
      visiteLocaux,
      visiteLocauxAt,
      deplacementProximiteDescription,
      vehiculesAdaptes,
      editedBy,
      ...(hebergementId ? [hebergementId] : []),
    ]);
    log.i("updateUniteHebergement - DONE");
  },
};
