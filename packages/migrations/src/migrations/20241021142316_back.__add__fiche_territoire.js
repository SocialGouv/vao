/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    CREATE TABLE back.fiche_territoire (
      id                 SERIAL               NOT NULL,
      ter_code           VARCHAR(4)           NOT NULL REFERENCES geo.territoires(code),
      service_mail       VARCHAR(320)         NULL,
      service_telephone  VARCHAR(12)          NULL,
      corresp_vao_nom    VARCHAR(128)         NULL,
      corresp_vao_prenom VARCHAR(128)         NULL,
      edited_at          TIMESTAMP            DEFAULT current_timestamp NOT NULL,
      CONSTRAINT pk_back_fiche_territoire PRIMARY KEY (id)
    );
    GRANT ALL ON TABLE back.fiche_territoire TO vao_u;
    INSERT INTO back.fiche_territoire (ter_code, edited_at)
      SELECT code, NOW()
      FROM geo.territoires;    
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DROP TABLE back.fiche_territoire;
    `);
};
