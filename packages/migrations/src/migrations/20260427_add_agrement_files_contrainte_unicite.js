/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = async function (knex) {
  // 3. Ajout de la contrainte d'unicité pour single-upload
  await knex.raw(`
		CREATE UNIQUE INDEX unique_agrement_category_single_upload
		ON front.agrement_files (agrement_id, category)
		WHERE category IN (
			'AGR_AMODIFIER',
			'AGR_REFUS',
			'AGR_PROCVERBAL',
			'AGR_IMMATRICUL',
			'AGR_ASSURRESP',
			'AGR_ASSURRAPAT',
			'AGR_PROJETSSEJOURSCASIER'
		);
	`);

  // 4. Ajout de la contrainte d'unicité pour multi-upload
  await knex.raw(`
		CREATE UNIQUE INDEX unique_agrement_category_multi_upload
		ON front.agrement_files (agrement_id, category, file_uuid)
		WHERE category NOT IN (
			'AGR_AMODIFIER',
			'AGR_REFUS',
			'AGR_PROCVERBAL',
			'AGR_IMMATRICUL',
			'AGR_ASSURRESP',
			'AGR_ASSURRAPAT',
			'AGR_PROJETSSEJOURSCASIER'
		);
	`);
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.raw(`
    DROP INDEX IF EXISTS unique_agrement_category_single_upload;
  `);
  await knex.raw(`
    DROP INDEX IF EXISTS unique_agrement_category_multi_upload;
  `);
};
