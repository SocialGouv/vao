/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    ALTER TABLE front.hebergement add organisme_id INTEGER;
    UPDATE front.hebergement h SET organisme_id = (
      SELECT DISTINCT org_id 
      FROM front.user_organisme uo 
      JOIN front.users u ON u.id = uo.use_id
      WHERE u.id = h.user_id
      );
    ALTER TABLE front.hebergement ADD CONSTRAINT pk_hebergement_organisme FOREIGN KEY (organisme_id) REFERENCES front.organismes(id);
    ALTER TABLE front.hebergement DROP user_id;
  `);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    ALTER TABLE front.hebergement add user_id INTEGER;
    UPDATE front.hebergement h SET user_id = (
      SELECT org_id 
      FROM front.user_organisme uo 
      JOIN front.organismes o ON o.id = uo.org_id
      WHERE o.id = h.organisme_id
      LIMIT 1
      );
    ALTER TABLE front.hebergement ADD CONSTRAINT pk_hebergement_user FOREIGN KEY (user_id) REFERENCES front.users(id);
    ALTER TABLE front.hebergement DROP organisme_id;
  `);
};
