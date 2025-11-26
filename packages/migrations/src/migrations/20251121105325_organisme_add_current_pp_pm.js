/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE front.personne_morale
    ADD COLUMN current BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;

    ALTER TABLE front.personne_physique
    ADD COLUMN current BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ADD COLUMN edited_at TIMESTAMP WITH TIME ZONE;

    UPDATE front.personne_morale
    SET created_at = (SELECT created_at FROM front.organismes WHERE front.organismes.id = front.personne_morale.organisme_id),
    edited_at = (SELECT edited_at FROM front.organismes WHERE front.organismes.id = front.personne_morale.organisme_id);

    UPDATE front.personne_physique
    SET created_at = (SELECT created_at FROM front.organismes WHERE front.organismes.id = front.personne_physique.organisme_id),
        edited_at = (SELECT edited_at FROM front.organismes WHERE front.organismes.id = front.personne_physique.organisme_id) ;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE front.personne_morale
    DROP COLUMN current,
    DROP COLUMN created_at,
    DROP COLUMN created_by,
    DROP COLUMN edited_at,
    DROP COLUMN edited_by;

    ALTER TABLE front.personne_physique
    DROP COLUMN current,
    DROP COLUMN created_at,
    DROP COLUMN created_by,
    DROP COLUMN edited_at,
    DROP COLUMN edited_by;
  `);
};
