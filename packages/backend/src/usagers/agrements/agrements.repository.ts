import { AgrementDto } from "@vao/shared-bridge";

import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import { AgrementEntity } from "./agrements.entity";
import {
  AgrementAnimationMapper,
  AgrementBilanAnnuelMapper,
  AgrementFilesMapper,
  AgrementSejoursMapper,
  AgrementsMapper,
} from "./agrements.mapper";

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
    await client.query(
      `INSERT INTO front.agrement_sejours (
        agrement_id, nom_hebergement, adresse_id, nb_vacanciers, mois
      )
      VALUES ($1, $2, $3, $4, $5);`,
      [agrementId, s.nomHebergement, s.adresseId, s.nbVacanciers, s.mois],
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
        await client.query(
          `INSERT INTO front.bilan_hebergement (
            agr_bilan_annuel_id, nom_hebergement, adresse_id, nb_jours, mois
          )
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id;`,
          [bilanId, bhe.nomHebergement, bhe.adresseId, bhe.nbJours, bhe.mois],
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
  async create({
    agrement,
    dateFinValidite,
  }: {
    agrement: AgrementDto;
    dateFinValidite: Date | null;
  }): Promise<number> {
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
          budget_gestion_perso, budget_paiement_securise, budget_complement,
          bilan_changement_evolution, bilan_aucun_changement_evolution,
          bilan_qual_perception_sensibilite, bilan_qual_perspective_evol,
          bilan_qual_elements_marquants, bilan_financier_comptabilite,
          bilan_financier_comparatif, bilan_financier_ressources_humaines,
          bilan_financier_commentaire,
          date_fin_validite
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,
          $9,$10,$11,$12,$13,$14,$15,$16,
          $17,$18,$19,$20,$21,
          $22,$23,$24,$25,$26,$27,
          $28,$29,$30,$31,$32,$33,$34,$35,
          $36,$37,$38,$39,$40, $41
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
        dateFinValidite,
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
      console.error("Erreur lors de la création d’un agrément :", err);
      throw err;
    } finally {
      client.release();
    }
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
      COALESCE(json_agg(DISTINCT act.*) FILTER (WHERE act.id IS NOT NULL), '[]') AS activite,
      COALESCE(json_agg(DISTINCT ani.*) FILTER (WHERE ani.id IS NOT NULL), '[]') AS agrement_animation,
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
      LEFT JOIN front.agrement_animation ani ON ani.agrement_id = agr.id
      LEFT JOIN front.activite act ON act.id = ani.activite_id
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
    await getPool().query(
      `SELECT bhe.*
            FROM front.bilan_hebergement bhe
            WHERE bhe.agr_bilan_annuel_id = ${response.rows[0].agrement_bilan_annuel[0].id}`,
    );
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

  async update({
    agrement,
    dateFinValidite,
  }: {
    agrement: AgrementDto;
    dateFinValidite: Date | null;
  }): Promise<number> {
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
        budget_paiement_securise = $30,
        budget_complement = $31,
        bilan_changement_evolution = $32,
        bilan_aucun_changement_evolution = $33,
        bilan_qual_perception_sensibilite = $34,
        bilan_qual_perspective_evol = $35,
        bilan_qual_elements_marquants = $36,
        bilan_financier_comptabilite = $37,
        bilan_financier_comparatif = $38,
        bilan_financier_ressources_humaines = $39,
        bilan_financier_commentaire = $40,
        date_fin_validite = $41
      WHERE id = $42;
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
        dateFinValidite,
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
      console.error("Erreur lors de la mise à jour de l’agrément :", err);
      throw err;
    } finally {
      client.release();
    }
    return agrementId;
  },
};
