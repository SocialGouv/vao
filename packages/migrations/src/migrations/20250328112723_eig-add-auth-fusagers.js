/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(
    `
CREATE TABLE front.roles (
   id             INT                      NOT NULL,
   label          VARCHAR(50)              NOT NULL,
   CONSTRAINT pk_front_roles PRIMARY KEY (id)
);

CREATE TABLE front.user_roles (
   use_id INT  NOT NULL REFERENCES front.users(id) ON DELETE CASCADE,
   rol_id INT  NOT NULL REFERENCES front.roles(id) ON DELETE CASCADE,
   CONSTRAINT pk_front_user_roles PRIMARY KEY (use_id,rol_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE front.roles TO vao_u;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE front.user_roles TO vao_u;

INSERT INTO front.roles 
    (id, label) 
VALUES 
    (1, 'Eig_Lecture'),
    (2, 'Eig_Ecriture');
    `,
  );
};
/*
-- Accorder les droits Eig_Lecture Front Usager
INSERT INTO front.user_roles (use_id,rol_id) VALUES ({id user front},1);
-- Accorder les droits Eig_Ecriture Front Usager
INSERT INTO front.user_roles (use_id,rol_id) VALUES ({id user front},2);
-- Supprimer les droits EIG
DELETE FROM front.user_roles 
*/
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
DROP TABLE front.roles;
DROP TABLE front.user_roles;
  `);
};
