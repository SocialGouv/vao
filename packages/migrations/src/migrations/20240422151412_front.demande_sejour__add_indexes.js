/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .withSchema("front")
    .raw(
      "CREATE INDEX demande_sejour__hebergement__departement__index ON front.demande_sejour ((hebergement ->> 'hebergements, 0, coordonnnees, adresse, departement'))",
    )
    .alterTable("demande_sejour", function (table) {
      table.index("statut", "demande_sejour__statut__index", {
        indexType: "FULLTEXT",
      });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .withSchema("front")
    .raw("DROP INDEX front.demande_sejour__hebergement__departement__index")
    .alterTable("demande_sejour", function (table) {
      table.dropIndex("_statut_");
      table.dropIndex("_hebergement__departement_");
    });
};
