/** Extraction à faire avant MEP pour la tranche 2 mois-3 mois
 *
 * SELECT id, lastconnection_at
 *  FROM front.users
 *  WHERE lastconnection_at > current_date - interval '3 month'
 *      AND lastconnection_at  <= current_date - interval '2 month'
 *      AND status_code not in ('BLOCKED', 'NEED_SIRET_VALIDATION')
 *  ORDER by lastconnection_at;
 *
 * Extraction à faire avant MEP pour la tranche 3 mois-5 mois
 *
 * SELECT id, lastconnection_at
 * FROM front.users
 * WHERE lastconnection_at > current_date - interval '5 month'
 *   AND lastconnection_at  <= current_date - interval '3 month'
 *   AND status_code not in ('BLOCKED', 'NEED_SIRET_VALIDATION');
 *
 * Extraction à faire avant MEP pour les plus de 5 mois
 *
 * SELECT id, lastconnection_at
 *  WHERE lastconnection_at  <= current_date - interval '5 month'
 *   AND status_code not in ('BLOCKED', 'NEED_SIRET_VALIDATION');
 */
exports.up = async (knex) => {
  await knex.schema.withSchema("front").table("users", function (table) {
    table.datetime("lastconnection_at_old");
  });
  // Sauvegarde de la dernière date de restauration pour trace ou éventuel
  await knex.raw(
    "UPDATE front.users SET lastconnection_at_old = lastconnection_at;",
  );
  await knex.raw(`
    UPDATE  front.users 
    SET lastconnection_at = current_date - interval '2 month'
    WHERE lastconnection_at > current_date - interval '3 month'  
      AND lastconnection_at <= current_date - interval '2 month'
      AND status_code::text not in ('BLOCKED', 'NEED_SIRET_VALIDATION');
  `);
  await knex.raw(`
    UPDATE  front.users 
    SET lastconnection_at = current_date - interval '3 month',
    last_mail_inactivity_2m_at = current_date - INTERVAL '2 months', 
    temporary_blocked_at = null
    WHERE lastconnection_at > current_date - interval '5 month'  
      AND lastconnection_at <= current_date - interval '3 month'
      AND status_code::text not in ('BLOCKED', 'NEED_SIRET_VALIDATION');
  `);
  await knex.raw(`
    UPDATE  front.users 
    SET lastconnection_at = current_date - interval '5 month',
    last_mail_inactivity_2m_at = current_date - INTERVAL '3 months', 
    temporary_blocked_at = current_date - INTERVAL '2 months', 
    status_code = 'TEMPORARY_BLOCKED'
    WHERE lastconnection_at <= current_date - interval '5 month'
      AND status_code::text not in ('BLOCKED', 'NEED_SIRET_VALIDATION');
  `);
};

exports.down = async (knex) => {
  await knex.raw(
    "UPDATE front.users SET lastconnection_at = lastconnection_at_old;",
  );

  await knex.schema.withSchema("front").table("users", function (table) {
    table.dropColumn("lastconnection_at_old");
  });
};
