/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

/**
 * Nettoie les doublons dans agrement_files et ajoute les contraintes d'unicité.
 */
exports.up = async function (knex) {
  // 1. Nettoyage des doublons single-upload
  await knex.raw(`
		WITH ranked AS (
			SELECT *,
				ROW_NUMBER() OVER (
					PARTITION BY agrement_id, category
					ORDER BY created_at DESC, id DESC
				) AS rn
			FROM front.agrement_files
			WHERE category IN (
				'AGR_AMODIFIER',
				'AGR_REFUS',
				'AGR_PROCVERBAL',
				'AGR_IMMATRICUL',
				'AGR_ASSURRESP',
				'AGR_ASSURRAPAT',
				'AGR_PROJETSSEJOURSCASIER'
			)
		)
		DELETE FROM front.agrement_files
		WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
	`);

  // 2. Nettoyage des doublons multi-upload
  await knex.raw(`
		WITH ranked AS (
			SELECT *,
				ROW_NUMBER() OVER (
					PARTITION BY agrement_id, category, file_uuid
					ORDER BY created_at DESC, id DESC
				) AS rn
			FROM front.agrement_files
			WHERE category NOT IN (
				'AGR_AMODIFIER',
				'AGR_REFUS',
				'AGR_PROCVERBAL',
				'AGR_IMMATRICUL',
				'AGR_ASSURRESP',
				'AGR_ASSURRAPAT',
				'AGR_PROJETSSEJOURSCASIER'
			)
		)
		DELETE FROM front.agrement_files
		WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
	`);

  // 3. Ajout de la contrainte d'unicité pour single-upload
  await knex.raw(`
		ALTER TABLE front.agrement_files
		ADD CONSTRAINT unique_agrement_category_single_upload UNIQUE (agrement_id, category)
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
		ALTER TABLE front.agrement_files
		ADD CONSTRAINT unique_agrement_category_multi_upload UNIQUE (agrement_id, category, file_uuid)
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
  // Suppression des contraintes d'unicité
  await knex.raw(`
		ALTER TABLE front.agrement_files DROP CONSTRAINT IF EXISTS unique_agrement_category_single_upload;
	`);
  await knex.raw(`
		ALTER TABLE front.agrement_files DROP CONSTRAINT IF EXISTS unique_agrement_category_multi_upload;
	`);
};
