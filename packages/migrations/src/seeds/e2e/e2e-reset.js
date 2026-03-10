/**
 * Should be executed only before the tests are run (main/preprod/dev).
 * This seed is used to reset the database to a known state.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const fs = require("node:fs");
const path = require("node:path");

exports.seed = async function (knex) {
  console.log("- Create vao_supprimer_demandes_sejour_organisme");
  const sqlFilePath = path.join(
    __dirname,
    "../../../../../pg/seeds/PG-1-proc-data-deletion.sql",
  );
  const sql = fs.readFileSync(sqlFilePath, "utf8");
  await knex.raw(sql);

  console.log("- Update fiche_territoire");
  await knex("back.fiche_territoire")
    .update({ service_mail: "tnra@example.com" })
    .where("service_mail", null);

  console.log("- Update users (cgu_accepted)");
  await knex("back.users")
    .update({ cgu_accepted: true })
    .where("mail", "like", "tnra%@example.com");

  console.log("- Cleanup tests users");
  const testsUsers = await knex("front.users")
    .select("id")
    .where("mail", "like", "%e2e-%@test.com")
    .orWhere("mail", "like", "%e2e-%@example.com")
    .orWhere("mail", "like", "tnra-%@example.com");

  console.log(`- ${testsUsers.length} Tests users founds`, testsUsers);
  const testsUserIds = testsUsers.map((u) => u.id);
  if (testsUserIds.length === 0) {
    return;
  }

  const organismes = await knex("front.user_organisme")
    .distinct("org_id")
    .whereIn("use_id", testsUserIds);

  console.log(`- ${organismes.length} organismes founds`);
  if (organismes.length === 0) {
    await knex("front.users").whereIn("id", testsUserIds).delete();
    return;
  }
  console.log(`- Cleanup organismes`);
  return knex.transaction(async (trx) => {
    try {
      for (const { org_id: orgId } of organismes) {
        await trx.raw("CALL vao_supprimer_organisme(?, ?)", [orgId, true]);
      }
      // await trx("front.users").whereIn("id", testsUserIds).delete();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  });
};
