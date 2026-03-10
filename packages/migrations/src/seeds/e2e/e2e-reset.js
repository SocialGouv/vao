/**
 * Should be executed only before the tests are run (main/preprod/dev).
 * This seed is used to reset the database to a known state.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  await knex("back.fiche_territoire")
    .update({ service_mail: "tnra@example.com" })
    .where("service_mail", null);
  await knex("back.users")
    .update({ cgu_accepted: true })
    .where("mail", "like", "tnra%@example.com");

  const testsUsers = await knex("front.users")
    .select("id")
    .where("mail", "like", "%e2e-%@test.com")
    .orWhere("mail", "like", "%e2e-%@example.com");
  return knex.transaction(async (trx) => {
    try {
      for (const user of testsUsers) {
        const usersOrganismes = await trx("front.user_organisme")
          .where("use_id", user.id)
          .select("org_id");
        for (const userOrganisme of usersOrganismes) {
          await trx("front.personne_physique")
            .where("organisme_id", userOrganisme.org_id)
            .delete();
          await trx("front.user_organisme")
            .where("use_id", user.id)
            .where("org_id", userOrganisme.org_id)
            .delete();
          await trx("front.organismes")
            .where("id", userOrganisme.org_id)
            .delete();
        }
      }
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
};
