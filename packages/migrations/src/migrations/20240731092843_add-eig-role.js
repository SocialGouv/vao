/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
INSERT INTO
    BACK.ROLES
VALUES
    (7, 'eig') ;
INSERT INTO
    BACK.USER_ROLES (
        SELECT
            ID AS USE_ID,
            7 AS ROL_ID
        FROM
            BACK.USERS
        )
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(
    `
DELETE FROM BACK.ROLES
WHERE
    ID =7`,
  );
};
