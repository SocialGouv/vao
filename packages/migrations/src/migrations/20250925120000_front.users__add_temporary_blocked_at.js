/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("users", function (table) {
      table.timestamp("temporary_blocked_at").nullable();
    })
    .then(() => {
      return knex.raw(
        "ALTER TYPE user_status ADD VALUE IF NOT EXISTS 'TEMPORARY_BLOCKED';",
      );
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.withSchema("front").alterTable("users", (table) => {
    table.dropColumn("temporary_blocked_at");
  });

  await knex.raw(`ALTER TYPE user_status RENAME TO user_status_old;`);
  await knex.raw(
    `CREATE TYPE user_status AS ENUM ('NEED_EMAIL_VALIDATION', 'VALIDATED', 'BLOCKED');`,
  );
  await knex.raw(`
    ALTER TABLE front.users
    ALTER COLUMN status_code TYPE user_status
    USING status_code::text::user_status;
  `);
  await knex.raw(`DROP TYPE user_status_old;`);
};

// Exécute ce script dans une transaction à part afin que l'ENUM puisse être vu par les scripts suivants
exports.config = { transaction: false };
