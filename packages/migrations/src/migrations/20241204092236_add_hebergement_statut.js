/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
CREATE TABLE front.hebergement_statut (
  id serial NOT NULL,
  value VARCHAR(100),
  CONSTRAINT pk_hebergement_statut PRIMARY KEY (id)
);

INSERT INTO
  front.hebergement_statut (value)
VALUES
  ('brouillon'),
  ('actif'),
  ('desactive');

ALTER TABLE front.hebergement
ADD COLUMN statut_id INTEGER REFERENCES front.hebergement_statut (id);

UPDATE front.hebergement
SET
  statut_id = (
    SELECT
      id
    FROM
      front.hebergement_statut
    WHERE
      value = 'actif'
  ) ;

GRANT ALL ON TABLE front.hebergement_statut TO vao_u;
GRANT ALL ON sequence front.hebergement_statut_id_seq TO vao_u;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
ALTER TABLE front.hebergement
DROP COLUMN statut_id;

DROP TABLE front.hebergement_statut;
  `);
};
