/**
 * Adds the missing indexes on the columns used by the correlated subqueries of
 * the admin dashboard stats / declaration listing (DemandeSejourRepository).
 *
 * - demande_sejour_to_hebergement.demande_sejour_id: the EXISTS/lateral subqueries
 *   filter on this column, but the only index (unique_ids_dates) leads with
 *   hebergement_id, so the predicate `WHERE demande_sejour_id = ds.id` cannot use
 *   it and falls back to a sequential scan repeated per row.
 * - demande_sejour_message.(declaration_id, id): the table only had a primary key
 *   on id; the "last message" subquery `MAX(id) WHERE declaration_id = ds.id` and
 *   the join on declaration_id both sequential-scanned it.
 *
 * Created CONCURRENTLY to avoid locking these tables in production, which requires
 * running outside a transaction.
 */

exports.config = { transaction: false };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.raw(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS demande_sejour_to_hebergement__demande_sejour_id__index
       ON front.demande_sejour_to_hebergement (demande_sejour_id)`,
  );
  await knex.raw(
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS demande_sejour_message__declaration_id__index
       ON front.demande_sejour_message (declaration_id, id DESC)`,
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(
    `DROP INDEX CONCURRENTLY IF EXISTS front.demande_sejour_message__declaration_id__index`,
  );
  await knex.raw(
    `DROP INDEX CONCURRENTLY IF EXISTS front.demande_sejour_to_hebergement__demande_sejour_id__index`,
  );
};
