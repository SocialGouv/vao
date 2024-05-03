/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex
    .withSchema("back")
    .table("roles")
    .insert({
      id: 5,
      label: "DemandeSejour_Lecture",
    })
    .then(() => {
      return knex
        .withSchema("back")
        .table("roles")
        .where({ label: "DemandeSejour" })
        .update({
          label: "DemandeSejour_Ecriture",
        });
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex
    .withSchema("back")
    .table("roles")
    .where({ label: "DemandeSejour_Ecriture" })
    .update({
      label: "DemandeSejour",
    })
    .then(() => {
      return knex
        .withSchema("back")
        .table("roles")
        .where({
          label: "DemandeSejour_Lecture",
        })
        .delete();
    });
};
