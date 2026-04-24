/**
 * Migration de la gestion des SVA (Silence Vaut Accord) pour les agréments
 */

exports.up = async function (knex) {
  /**
   * Création du type ENUM pour le statut du timer SVA
   * - RUNNING : le timer est en cours d'exécution (Le délai de silence vaut accord cours et aucune décision n'a été prise)
   * - PAUSED : le timer est en pause (Supendu temporairement cas d'une demande de complément d'information)
   * - STOPPED : le timer est arrêté (La décision de validation ou de refus de l'agrément a été prise)
   * - FINISHED : le timer est terminé (Le délai de silence vaut accord est écoulé sans décision prise, l'agrément est considéré comme validé par défaut)
   */
  await knex.schema.raw(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'agrement_sva_timer_statut') THEN
        CREATE TYPE front.agrement_sva_timer_statut AS ENUM (
          'RUNNING',
          'PAUSED',
          'STOPPED',
          'FINISHED'
        );
      END IF;
    END $$;
  `);

  // --- TABLE agrements_sva_timer---
  await knex.schema
    .withSchema("front")
    .createTable("agrement_sva_timer", (table) => {
      table.increments("id").primary();
      table.timestamp("t0").notNullable();
      table
        .specificType("statut", "front.agrement_sva_timer_statut")
        .notNullable();
      table.bigInteger("agrement_id").notNullable().unique();
      table.foreign("agrement_id").references("id").inTable("front.agrements");
      table.timestamp("created_at").notNullable();
      table.timestamp("updated_at").nullable();
      table.timestamp("mail_delay_21d_at").nullable();
    });

  // --- TABLE agrement_sva_periodes ---
  await knex.schema
    .withSchema("front")
    .createTable("agrement_sva_periodes", (table) => {
      table.increments("id").primary();
      table.bigInteger("agrement_sva_timer_id").notNullable().index();
      table
        .foreign("agrement_sva_timer_id")
        .references("id")
        .inTable("front.agrement_sva_timer");
      table.timestamp("start_at").notNullable();
      table.timestamp("end_at").nullable();
    });

  return knex.raw(`
    GRANT ALL ON TABLE front.agrement_sva_timer TO vao_u;
    GRANT ALL ON TABLE front.agrement_sva_periodes TO vao_u;
    GRANT ALL ON SEQUENCE front.agrement_sva_timer_id_seq TO vao_u;
    GRANT ALL ON SEQUENCE front.agrement_sva_periodes_id_seq TO vao_u;
  `);
};

exports.down = async function (knex) {
  await knex.schema
    .withSchema("front")
    .dropTableIfExists("agrement_sva_timer")
    .dropTableIfExists("agrement_sva_periodes");

  await knex.schema.raw(`DROP TYPE IF EXISTS front.agrement_sva_timer_statut;`);
};
