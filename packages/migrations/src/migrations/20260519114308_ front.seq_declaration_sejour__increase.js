/**
 * Migration technique
 * Augmentation de la limite de la séquence de déclaration de séjour pour éviter les erreurs de dépassement
 */

exports.up = async function (knex) {
  await knex.schema.raw(`
    ALTER SEQUENCE front.seq_declaration_sejour AS bigint MAXVALUE 2147483647;
  `);
};

exports.down = async function (knex) {
  await knex.schema.raw(`
    ALTER SEQUENCE front.seq_declaration_sejour AS bigint MAXVALUE 9999;
`);
};
