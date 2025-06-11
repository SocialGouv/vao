/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.raw(`
    INSERT INTO front.user_roles (use_id, rol_id) select u.id,2 FROM front.users u 
    WHERE u.id NOT IN (SELECT use_id FROM front.user_roles ur WHERE ur.use_id = u.id)
    AND (u.id IN (SELECT MIN(use_id)
          FROM front.user_organisme uo
          INNER JOIN front.personne_morale pm ON pm.organisme_id = uo.org_id AND pm.siege_social = true
          GROUP BY uo.org_id
          )	
      or u.id IN (SELECT use_id
          FROM front.user_organisme uo
          INNER JOIN front.personne_physique pp ON pp.organisme_id = uo.org_id)
      )
    AND status_code = 'VALIDATED';
`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.raw(`
    DELETE front.user_roles;
`);
};
