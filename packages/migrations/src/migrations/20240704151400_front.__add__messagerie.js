/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE TABLE front.demande_sejour_message (
      id                 SERIAL               NOT NULL,
      declaration_id     INTEGER              NOT NULL REFERENCES front.demande_sejour(id),
      front_user_id      INTEGER              NULL,
      back_user_id       INTEGER              NULL,
      message            VARCHAR(1000)        NOT NULL,
      file               JSONB                NULL,
      created_at         TIMESTAMP            DEFAULT current_timestamp NOT NULL,
      CONSTRAINT pk_front_demande_sejour_message PRIMARY KEY (id)
    );
    GRANT ALL ON TABLE front.demande_sejour_message TO vao_u;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA front TO vao_u;

  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TABLE front.demande_sejour_message;
    `);
};
