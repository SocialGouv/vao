import type {
  AGREMENT_HISTORY_TYPE,
  AgrementHistoryItem,
  AgrementHistoryRow,
} from "@vao/shared-bridge";
import { AGREMENT_STATUT, AgrementDto } from "@vao/shared-bridge";

import { saveAdresse } from "../../services/adresse";
import {
  ActiviteEntity,
  AgrementEntity,
} from "../../shared/agrements/agrements.entity";
import {
  AgrementAnimationMapper,
  AgrementBilanAnnuelMapper,
  AgrementFilesMapper,
  AgrementSejoursMapper,
  AgrementsMapper,
} from "../../shared/agrements/agrements.mapper";
import { AgrementsRepositoryShared } from "../../shared/agrements/agrements.repository";
import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);

// ------------------------------------------------------------
// 🔧 Helpers d'insertion réutilisables
// ------------------------------------------------------------
async function insertAgrementFiles(
  client: any,
  agrementId: number | null | undefined,
  agrement: AgrementDto,
) {
  if (!agrement.agrementFiles?.length) return;

  for (const f of agrement.agrementFiles) {
    await client.query(
      `INSERT INTO front.agrement_files (agrement_id, category, file_uuid)
       VALUES ($1, $2, $3);`,
      [agrementId, f.category, f.fileUuid],
    );
  }
}

async function insertAgrementSejours(
  client: any,
  agrementId: number | null | undefined,
  agrement: AgrementDto,
) {
  if (!agrement.agrementSejours?.length) return;
  for (const s of agrement.agrementSejours) {
    let adresseId = s?.adresse?.id || null;
    if (!adresseId && s?.adresse) {
      adresseId = await saveAdresse(client, s.adresse);
    }
    await client.query(
      `INSERT INTO front.agrement_sejours (
        agrement_id, nom_hebergement, adresse_id, nb_vacanciers, mois
      )
      VALUES ($1, $2, $3, $4, $5);`,
      [agrementId, s.nomHebergement, adresseId, s.nbVacanciers, s.mois],
    );
  }
}

async function insertAgrementAnimations(
  client: any,
  agrementId: number | null | undefined,
  agrement: AgrementDto,
) {
  if (!agrement.agrementAnimation?.length) return;

  for (const a of agrement.agrementAnimation) {
    await client.query(
      `INSERT INTO front.agrement_animation (agrement_id, activite_id)
       VALUES ($1, $2);`,
      [agrementId, a.activiteId],
    );
  }
}

async function insertAgrementBilans(
  client: any,
  agrementId: number | null | undefined,
  agrement: AgrementDto,
) {
  if (!agrement.agrementBilanAnnuel?.length) return;

  for (const bil of agrement.agrementBilanAnnuel) {
    const bilanResult = await client.query(
      `INSERT INTO front.agrement_bilan_annuel (
        agrement_id, annee, nb_global_vacanciers, nb_hommes, nb_femmes,
        nb_total_jours_vacances, type_handicap, tranche_age
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id;`,
      [
        agrementId,
        bil.annee,
        bil.nbGlobalVacanciers,
        bil.nbHommes,
        bil.nbFemmes,
        bil.nbTotalJoursVacances,
        bil.typeHandicap,
        bil.trancheAge,
      ],
    );

    const bilanId = bilanResult.rows[0].id;

    if (bil.bilanHebergement) {
      for (const bhe of bil.bilanHebergement) {
        let adresseId = bhe?.adresse?.id || null;
        if (!adresseId && bhe?.adresse) {
          adresseId = await saveAdresse(client, bhe.adresse);
        }
        await client.query(
          `INSERT INTO front.bilan_hebergement (
            agr_bilan_annuel_id, nom_hebergement, adresse_id, nb_jours, mois
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id;`,
          [bilanId, bhe.nomHebergement, adresseId, bhe.nbJours, bhe.mois],
        );
      }
    }
  }
}

// ------------------------------------------------------------
// 🏗️ Repository principal
// ------------------------------------------------------------
export const AgrementsRepository = {
  /**
   * Crée un nouvel agrément et ses sous-éléments
   */
  async create({ agrement }: { agrement: AgrementDto }): Promise<number> {
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");

      const agrementInsertQuery = `
        INSERT INTO front.agrements (
          statut, organisme_id, updated_at, date_obtention_certificat, date_depot,
          date_verif_completure, date_confirm_completude, commentaire, motivations,
          immatriculation, sejour_nb_envisage, sejour_commentaire, vacanciers_nb_envisage,
          animation_autre, accomp_resp_nb, accomp_resp_comp_exp, accomp_resp_recrute_urg,
          accomp_resp_attest_hono, transport_aller_retour, transport_sejour,
          suivi_med_distribution, suivi_med_accord_sejour,
          protocole_evac_urg, protocole_rapat_urg, protocole_rapat_etranger,
          protocole_materiel, protocole_info_famille, protocole_remboursement,
          budget_gestion_perso, budget_perso_gestion_complementaire, budget_paiement_securise, budget_complement,
          bilan_changement_evolution, bilan_aucun_changement_evolution,
          bilan_qual_perception_sensibilite, bilan_qual_perspective_evol,
          bilan_qual_elements_marquants, bilan_financier_comptabilite,
          bilan_financier_comparatif, bilan_financier_ressources_humaines,
          bilan_financier_commentaire,
          date_fin_validite, sejour_type_handicap,
          region_obtention, numero, date_obtention, file
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,
          $9,$10,$11,$12,$13,$14,$15,$16,
          $17,$18,$19,$20,$21,
          $22,$23,$24,$25,$26,$27,
          $28,$29,$30,$31,$32,$33,$34,$35,
          $36,$37,$38,$39,$40, $41,
          $42, $43, $44, $45, $46, $47
        )
        RETURNING id;
      `;

      const agrementValues = [
        agrement.statut,
        agrement.organismeId,
        agrement.updatedAt,
        agrement.dateObtentionCertificat,
        agrement.dateDepot,
        agrement.dateVerifCompleture,
        agrement.dateConfirmCompletude,
        agrement.commentaire,
        agrement.motivations,
        agrement.immatriculation,
        agrement.sejourNbEnvisage,
        agrement.sejourCommentaire,
        agrement.vacanciersNbEnvisage,
        agrement.animationAutre,
        agrement.accompRespNb,
        agrement.accompRespCompExp,
        agrement.accompRespRecruteUrg,
        agrement.accompRespAttestHono,
        agrement.transportAllerRetour,
        agrement.transportSejour,
        agrement.suiviMedDistribution,
        agrement.suiviMedAccordSejour,
        agrement.protocoleEvacUrg,
        agrement.protocoleRapatUrg,
        agrement.protocoleRapatEtranger,
        agrement.protocoleMateriel,
        agrement.protocoleInfoFamille,
        agrement.protocoleRemboursement,
        agrement.budgetGestionPerso,
        agrement.budgetPersoGestionComplementaire,
        agrement.budgetPaiementSecurise,
        agrement.budgetComplement,
        agrement.bilanChangementEvolution,
        agrement.bilanAucunChangementEvolution,
        agrement.bilanQualPerceptionSensibilite,
        agrement.bilanQualPerspectiveEvol,
        agrement.bilanQualElementsMarquants,
        agrement.bilanFinancierComptabilite,
        agrement.bilanFinancierComparatif,
        agrement.bilanFinancierRessourcesHumaines,
        agrement.bilanFinancierCommentaire,
        agrement.dateFinValidite,
        agrement.sejourTypeHandicap,
        agrement.regionObtention,
        agrement.numero,
        agrement.dateObtention,
        agrement.file,
      ];

      const result = await client.query(agrementInsertQuery, agrementValues);
      const agrementId = result.rows[0].id;

      // 🔁 Factorisation : on réutilise les helpers
      await insertAgrementFiles(client, agrementId, agrement);
      await insertAgrementSejours(client, agrementId, agrement);
      await insertAgrementAnimations(client, agrementId, agrement);
      await insertAgrementBilans(client, agrementId, agrement);

      await client.query("COMMIT");
      return agrementId;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async getAllActivites(): Promise<ActiviteEntity[]> {
    const client = await getPool().connect();
    const query = `
      SELECT id, code, libelle, activite_type
      FROM front.activite
      ORDER BY libelle ASC;
    `;
    const result = await client.query(query);
    return result.rows;
  },

  async getById({
    agrementId,
    withDetails,
  }: {
    agrementId: number;
    withDetails: boolean;
  }): Promise<AgrementDto | null> {
    return AgrementsRepositoryShared.getById({ agrementId, withDetails });
  },
  /**
   * Récupère un agrément par organisme ID (avec ou sans détails liés)
   */
  async getByOrganismeId({
    organismeId,
    withDetails,
  }: {
    organismeId: number;
    withDetails: boolean;
  }): Promise<AgrementDto | null> {
    log.i("getByOrganismeId - IN");
    const query = `
      SELECT
        agr.*
        ${
          withDetails
            ? `,
          COALESCE(
            (
              SELECT json_agg(
                jsonb_build_object(
                  'id', ani.id,
                  'activite_id', ani.activite_id,
                  'agrement_id', ani.agrement_id,
                  'created_at', ani.created_at,
                  'updated_at', ani.updated_at,
                  'activite', jsonb_build_object(
                    'id', act.id,
                    'code', act.code,
                    'libelle', act.libelle,
                    'activite_type', act.activite_type
                  )
                )
              )
              FROM front.agrement_animation ani
              LEFT JOIN front.activite act ON act.id = ani.activite_id
              WHERE ani.agrement_id = agr.id
            ),
            '[]'
          ) AS agrement_animation,
          COALESCE(json_agg(DISTINCT fil.*) FILTER (WHERE fil.id IS NOT NULL), '[]') AS agrement_file,
          COALESCE(json_agg(DISTINCT sej.*) FILTER (WHERE sej.id IS NOT NULL), '[]') AS agrement_sejour,

          COALESCE(
            (
              SELECT json_agg(
                to_jsonb(bil) || jsonb_build_object(
                  'bilan_hebergement',
                  COALESCE(
                    (
                      SELECT json_agg(bhe.*)
                      FROM front.bilan_hebergement bhe
                      WHERE bhe.agr_bilan_annuel_id = bil.id
                    ),
                    '[]'::json
                  )
                )
              )
              FROM front.agrement_bilan_annuel bil
              WHERE bil.agrement_id = agr.id
            ),
            '[]'
          ) AS agrement_bilan_annuel
          `
            : ""
        }
      FROM front.agrements agr
      ${
        withDetails
          ? `
          LEFT JOIN front.agrement_files fil ON fil.agrement_id = agr.id
          LEFT JOIN front.agrement_sejours sej ON sej.agrement_id = agr.id
          `
          : ""
      }
      WHERE agr.organisme_id = $1
      GROUP BY agr.id;
    `;

    const response = await getPool().query(query, [organismeId]);
    log.i("getByOrganismeId - DONE");
    if (!response.rows?.length) return null;
    const row = response.rows[0] as AgrementEntity;
    const agrementDto = AgrementsMapper.toModel(row);

    if (withDetails) {
      agrementDto.agrementAnimation = row.agrement_animation
        ? AgrementAnimationMapper.toModels(row.agrement_animation)
        : [];

      agrementDto.agrementFiles = row.agrement_file
        ? AgrementFilesMapper.toModels(row.agrement_file)
        : [];

      agrementDto.agrementSejours = row.agrement_sejour
        ? AgrementSejoursMapper.toModels(row.agrement_sejour)
        : [];

      agrementDto.agrementBilanAnnuel = row.agrement_bilan_annuel
        ? AgrementBilanAnnuelMapper.toModels(row.agrement_bilan_annuel)
        : [];
    }

    return agrementDto;
  },

  async getHistory(agrementId: number): Promise<AgrementHistoryItem[]> {
    const client = await getPool().connect();
    try {
      const query = `
       SELECT
          h.id,
          h.source,
          h.agrement_id,
          h.usager_user_id,
          u.nom AS usager_nom,
          u.prenom AS usager_prenom,
          u.mail AS usager_mail,
          h.bo_user_id,
          b.nom AS bo_nom,
          b.prenom AS bo_prenom,
          b.mail AS bo_mail,
          h.type,
          h.type_precision,
          h.metadata,
          h.created_at
        FROM front.agrement_history h
        LEFT JOIN front.users u ON h.usager_user_id = u.id
        LEFT JOIN back.users b ON h.bo_user_id = b.id
        WHERE h.agrement_id = $1
        ORDER BY h.created_at DESC;
      `;
      const result = await client.query(query, [agrementId]);
      return result.rows.map((row: AgrementHistoryRow) => ({
        agrement_id: row.agrement_id,
        bo_user: row.bo_user_id
          ? {
              id: row.bo_user_id,
              mail: row.bo_mail,
              nom: row.bo_nom,
              prenom: row.bo_prenom,
            }
          : null,
        created_at: row.created_at,
        id: row.id,
        metadata: row.metadata,
        source: row.source,
        type: row.type,
        type_precision: row.type_precision,
        usager_user: row.usager_user_id
          ? {
              id: row.usager_user_id,
              mail: row.usager_mail,
              nom: row.usager_nom,
              prenom: row.usager_prenom,
            }
          : null,
      }));
    } finally {
      client.release();
    }
  },

  async getList({
    userId,
    statut,
  }: {
    userId: number;
    statut?: string | null;
  }): Promise<AgrementDto[] | []> {
    log.i("getList - IN");

    let query = `
    SELECT
      agr.*
    FROM front.agrements agr
    INNER JOIN front.user_organisme uo ON uo.org_id = agr.organisme_id
    INNER JOIN front.users u ON u.id = uo.use_id
    WHERE u.id = $1
  `;

    const params: any[] = [userId];

    if (statut) {
      query += ` AND agr.statut = $2`;
      params.push(statut);
    }

    const response = await getPool().query(query, params);

    if (!response.rows?.length) return [];

    const agrements: AgrementDto[] = [];
    for (const row of response.rows) {
      const agrementDto = AgrementsMapper.toModel(row);
      agrements.push(agrementDto);
    }

    log.i("getList - DONE");
    return agrements;
  },

  /**
   * Récupère le courriel du user responsable d'un agrément.
   */
  async getUserMail(agrementId: number): Promise<string | null> {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `SELECT u.mail AS user_mail
          FROM front.agrements a
          JOIN front.organismes o ON a.organisme_id = o.id
          JOIN front.user_organisme uo ON uo.org_id = o.id
          JOIN front.users u ON uo.use_id = u.id
          WHERE a.id = $1
          LIMIT 1;`,
        [agrementId],
      );
      if (result.rows.length === 0) {
        return null;
      }
      return result.rows[0]?.user_mail;
    } finally {
      client.release();
    }
  },

  async insertHistoryEvent({
    source,
    agrementId,
    usagerUserId,
    type,
    typePrecision,
    metadata,
  }: {
    source: string;
    agrementId: number;
    usagerUserId?: number | null;
    type?: AGREMENT_HISTORY_TYPE | null;
    typePrecision?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<number> {
    const query = `
      INSERT INTO front.agrement_history (
        source,
        agrement_id,
        usager_user_id,
        bo_user_id,
        type,
        type_precision,
        metadata,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id;
    `;
    const values = [
      source,
      agrementId,
      usagerUserId ?? null,
      null, // bo_user_id n'est pas utilisé côté usager
      type ?? null,
      typePrecision ?? null,
      metadata ?? null,
    ];
    const { rows } = await getPool().query(query, values);
    return rows[0].id;
  },

  async update({ agrement }: { agrement: AgrementDto }): Promise<number> {
    const client = await getPool().connect();
    const agrementId: number = agrement.id!;

    try {
      if (agrementId == null) {
        throw new Error(
          "Impossible de mettre à jour : l'ID de l'agrément est manquant",
        );
      }
      await client.query("BEGIN");

      // ✅ 1. Mise à jour du principal
      const agrementUpdateQuery = `
      UPDATE front.agrements
      SET
        statut = $1,
        organisme_id = $2,
        updated_at = $3,
        date_obtention_certificat = $4,
        date_depot = $5,
        date_verif_completure = $6,
        date_confirm_completude = $7,
        commentaire = $8,
        motivations = $9,
        immatriculation = $10,
        sejour_nb_envisage = $11,
        sejour_commentaire = $12,
        vacanciers_nb_envisage = $13,
        animation_autre = $14,
        accomp_resp_nb = $15,
        accomp_resp_comp_exp = $16,
        accomp_resp_recrute_urg = $17,
        accomp_resp_attest_hono = $18,
        transport_aller_retour = $19,
        transport_sejour = $20,
        suivi_med_distribution = $21,
        suivi_med_accord_sejour = $22,
        protocole_evac_urg = $23,
        protocole_rapat_urg = $24,
        protocole_rapat_etranger = $25,
        protocole_materiel = $26,
        protocole_info_famille = $27,
        protocole_remboursement = $28,
        budget_gestion_perso = $29,
        budget_perso_gestion_complementaire = $30,
        budget_paiement_securise = $31,
        budget_complement = $32,
        bilan_changement_evolution = $33,
        bilan_aucun_changement_evolution = $34,
        bilan_qual_perception_sensibilite = $35,
        bilan_qual_perspective_evol = $36,
        bilan_qual_elements_marquants = $37,
        bilan_financier_comptabilite = $38,
        bilan_financier_comparatif = $39,
        bilan_financier_ressources_humaines = $40,
        bilan_financier_commentaire = $41,
        date_fin_validite = $42,
        sejour_type_handicap = $43,
        region_obtention = $44,
        numero = $45,
        date_obtention = $46,
        file = $47
      WHERE id = $48;
    `;

      const agrementValues = [
        agrement.statut,
        agrement.organismeId,
        agrement.updatedAt,
        agrement.dateObtentionCertificat,
        agrement.dateDepot,
        agrement.dateVerifCompleture,
        agrement.dateConfirmCompletude,
        agrement.commentaire,
        agrement.motivations,
        agrement.immatriculation,
        agrement.sejourNbEnvisage,
        agrement.sejourCommentaire,
        agrement.vacanciersNbEnvisage,
        agrement.animationAutre,
        agrement.accompRespNb,
        agrement.accompRespCompExp,
        agrement.accompRespRecruteUrg,
        agrement.accompRespAttestHono,
        agrement.transportAllerRetour,
        agrement.transportSejour,
        agrement.suiviMedDistribution,
        agrement.suiviMedAccordSejour,
        agrement.protocoleEvacUrg,
        agrement.protocoleRapatUrg,
        agrement.protocoleRapatEtranger,
        agrement.protocoleMateriel,
        agrement.protocoleInfoFamille,
        agrement.protocoleRemboursement,
        agrement.budgetGestionPerso,
        agrement.budgetPersoGestionComplementaire,
        agrement.budgetPaiementSecurise,
        agrement.budgetComplement,
        agrement.bilanChangementEvolution,
        agrement.bilanAucunChangementEvolution,
        agrement.bilanQualPerceptionSensibilite,
        agrement.bilanQualPerspectiveEvol,
        agrement.bilanQualElementsMarquants,
        agrement.bilanFinancierComptabilite,
        agrement.bilanFinancierComparatif,
        agrement.bilanFinancierRessourcesHumaines,
        agrement.bilanFinancierCommentaire,
        agrement.dateFinValidite,
        agrement.sejourTypeHandicap,
        agrement.regionObtention,
        agrement.numero,
        agrement.dateObtention,
        agrement.file,
        agrementId,
      ];

      await client.query(agrementUpdateQuery, agrementValues);

      // ✅ 2. Suppression des sous-tables existantes
      await client.query(
        `DELETE FROM front.agrement_files WHERE agrement_id = $1`,
        [agrementId],
      );
      await client.query(
        `DELETE FROM front.agrement_sejours WHERE agrement_id = $1`,
        [agrementId],
      );
      await client.query(
        `DELETE FROM front.agrement_animation WHERE agrement_id = $1`,
        [agrementId],
      );
      const bilansToDelete = await client.query(
        `SELECT id FROM front.agrement_bilan_annuel WHERE agrement_id = $1`,
        [agrementId],
      );
      for (const bil of bilansToDelete.rows) {
        await client.query(
          `DELETE FROM front.bilan_hebergement WHERE agr_bilan_annuel_id = $1`,
          [bil.id],
        );
      }
      await client.query(
        `DELETE FROM front.agrement_bilan_annuel WHERE agrement_id = $1`,
        [agrementId],
      );

      // ✅ 3. Réinsertion des nouvelles données via les helpers existants
      await insertAgrementFiles(client, agrementId, agrement);
      await insertAgrementSejours(client, agrementId, agrement);
      await insertAgrementAnimations(client, agrementId, agrement);
      await insertAgrementBilans(client, agrementId, agrement);

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    return agrementId;
  },
  /**
   * Met à jour uniquement le statut d'un agrément
   */
  async updateStatut({
    agrementId,
    statut,
  }: {
    agrementId: number;
    statut: AGREMENT_STATUT;
  }): Promise<boolean> {
    const client = await getPool().connect();
    try {
      const result = await client.query(
        `UPDATE front.agrements SET statut = $1, updated_at = NOW() WHERE id = $2`,
        [statut, agrementId],
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  },
};
