/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .raw(
      "CREATE INDEX organismes__personne_morale__siren__index ON front.organismes ((personne_morale ->> 'siren'))",
    )
    .raw(
      "CREATE INDEX organismes__personne_morale__siegeSocial__index ON front.organismes ((personne_morale ->> 'siegeSocial'))",
    )
    .raw(
      "CREATE INDEX organismes__personne_morale__siret__index ON front.organismes ((personne_morale ->> 'siret'))",
    );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .alterTable("organismes", function (table) {
      table.dropIndex("_personne_morale__siren_");
      table.dropIndex("_personne_morale__siegeSocial_");
      table.dropIndex("_personne_morale__siret_");
    });
};
