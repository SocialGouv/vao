import { AgrementsDto } from "@vao/shared-bridge";

import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";
import { AgrementEntity } from "./agrements.entity";
import {
  //ActiviteMapper,
  AgrementAnimationMapper,
  AgrementBilanAnnuelMapper,
  AgrementFilesMapper,
  AgrementSejoursMapper,
  AgrementsMapper,
  //BilanHebergementMapper,
} from "./agrements.mapper";

const log = Logger(module.filename);

export const AgrementsRepository = {
  async consoleSql({ query, values }: { query: unknown; values: unknown }) {
    const interpolatedQuery = query.replace(/\$(\d+)/g, (_, n) => {
      const val = values[Number(n) - 1];
      if (val === null || val === undefined) return "NULL";
      if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
      if (val instanceof Date) return `'${val.toISOString()}'`;
      return val.toString();
    });
    console.log("agrementValues ", values);
    console.log("🧾 Executing SQL:\n", interpolatedQuery);
  },
  /**
   * Crée un nouvel agrément (et ses sous-éléments le cas échéant)
   */
  async create({ agrement }: { agrement: AgrementsDto }): Promise<number> {
    const client = await getPool().connect();
    //console.log("create agrement", agrement);

    //console.log("agrement.statut", agrement.statut);
    try {
      await client.query("BEGIN");

      // Insertion principale dans front.agrements
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
          bilan_financier_commentaire
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21,
          $22, $23, $24, $25, $26, $27,
          $28, $29, $30, $31, $32, $33, $34, $35,
          $36, $37, $38, $39,$40
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
      ];

      const agrementResult = await client.query(
        agrementInsertQuery,
        agrementValues,
      );
      const agrementId = agrementResult.rows[0].id;

      // Fichiers associés à l'agrément
      if (agrement.agrementFiles && agrement.agrementFiles.length > 0) {
        for (const f of agrement.agrementFiles) {
          await AgrementsRepository.consoleSql({
            query: `INSERT INTO front.agrement_files (agrement_id, category, file_uuid)
             VALUES ($1, $2, $3);`,
            values: [agrementId, f.category, f.fileUuid],
          });

          await client.query(
            `INSERT INTO front.agrement_files (agrement_id, category, file_uuid)
             VALUES ($1, $2, $3);`,
            [agrementId, f.category, f.fileUuid],
          );
        }
      }

      // Séjours associés à l'agrément
      if (agrement.agrementSejours && agrement.agrementSejours.length > 0) {
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

      // Animations associés à l'agrément
      if (agrement.agrementAnimation && agrement.agrementAnimation.length > 0) {
        for (const a of agrement.agrementAnimation) {
          await client.query(
            `INSERT INTO front.agrement_animation (agrement_id, activite_id)
             VALUES ($1, $2);`,
            [agrementId, a.activiteId],
          );
        }
      }

      // Bilans annuels associés à l'agrément
      if (
        agrement.agrementBilanAnnuel &&
        agrement.agrementBilanAnnuel.length > 0
      ) {
        for (const b of agrement.agrementBilanAnnuel) {
          const bilanResult = await client.query(
            `INSERT INTO front.agrement_bilan_annuel (
              agrement_id, annee, nb_global_vacanciers, nb_hommes, nb_femmes,
              nb_total_jours_vacances, type_handicap, tranche_age
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id;`,
            [
              agrementId,
              b.annee,
              b.nbGlobalVacanciers,
              b.nbHommes,
              b.nbFemmes,
              b.nbTotalJoursVacances,
              b.typeHandicap,
              b.trancheAge,
            ],
          );

          const bilanId = bilanResult.rows[0].id;

          if (b.bilanHebergement) {
            await client.query(
              `INSERT INTO front.bilan_hebergement (
                agr_bilan_annuel_id, nom_hebergement, adresse_id, nb_jours, mois
              )
              VALUES ($1, $2, $3, $4, $5);`,
              [
                bilanId,
                b.bilanHebergement.nomHebergement,
                b.bilanHebergement.adresseId,
                b.bilanHebergement.nbJours,
                b.bilanHebergement.mois,
              ],
            );
          }
        }
      }

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
  getByOrganismeId: async ({
    organismeId,
    withDetails,
  }: {
    organismeId: number;
    withDetails: boolean;
  }): Promise<AgrementsDto | null> => {
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
          COALESCE(json_agg(DISTINCT bil.*) FILTER (WHERE bil.id IS NOT NULL), '[]') AS agrement_bilan_annuel`
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
          LEFT JOIN front.agrement_bilan_annuel bil ON bil.agrement_id = agr.id
        `
          : ""
      }
      WHERE agr.organisme_id = $1
      GROUP BY agr.id;
    `;

    const response = await getPool().query(query, [organismeId]);
    log.i("getByOrganismeId - DONE");

    if (!response.rows?.length) {
      return null;
    }

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
};
