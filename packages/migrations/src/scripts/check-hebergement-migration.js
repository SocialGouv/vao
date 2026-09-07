/**
 * NOTICE de lancement du script de contrôle de cohérence de la migration hébergement → site / unite_hebergement
 * set -a && source /home/scherer/Projet/vao/.env && set +a
 * node ../migrations/src/scripts/check-hebergement-migration.js   # depuis la racine
 * # ou depuis packages/migrations :
 * node src/scripts/check-hebergement-migration.js
 *
 */

const knex = require("knex")({
  client: "pg",
  connection: {
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    password: process.env.PG_VAO_SUPERPASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: process.env.PGSSLMODE
      ? {
          rejectUnauthorized: false, // to authorize CNPG self-signed certificates
        }
      : false,
    user: process.env.PG_VAO_SUPERUSER,
  },
});

async function main() {
  console.log(
    "=== Contrôle de cohérence migration hébergement → site / unite_hebergement ===\n",
  );

  const h = await knex.raw(`
    SELECT
      count(*)                                    AS total,
      count(*) FILTER (WHERE supprime)            AS supprime,
      count(*) FILTER (WHERE NOT supprime)        AS non_supprime,
      count(*) FILTER (WHERE organisme_id IS NULL) AS organisme_null
    FROM front.hebergement
  `);

  const hAttendu = await knex.raw(`
    SELECT
      count(*)                               AS total,
      count(*) FILTER (WHERE current)        AS current,
      count(*) FILTER (WHERE NOT current)    AS non_current,
      count(DISTINCT hebergement_id)         AS hebergement_distinct,
      count(DISTINCT hebergement_id) FILTER (WHERE current) AS hebergement_distinct_current
    FROM front.hebergement
    WHERE NOT supprime
      AND organisme_id IS NOT NULL
  `);

  const cibles = await knex.raw(`
    SELECT
      (SELECT count(*) FROM front.site)                         AS site,
      (SELECT count(*) FROM front.unite_hebergement)            AS unite_hebergement,
      (SELECT count(*) FROM front.site_organisme)               AS site_organisme,
      (SELECT count(*) FROM front.unite_hebergement
        WHERE "current")                                        AS uh_current,
      (SELECT count(*) FROM front.unite_hebergement
        WHERE NOT "current")                                    AS uh_non_current,
      (SELECT count(DISTINCT hebergement_id) FROM front.unite_hebergement) AS uh_hebergement_distinct
  `);

  const orphans = await knex.raw(`
    SELECT
      (SELECT count(*) FROM front.unite_hebergement
        WHERE site_id NOT IN (SELECT site_id FROM front.site))       AS uh_sans_site,
      (SELECT count(*) FROM front.unite_hebergement AS uh
        WHERE NOT EXISTS (
          SELECT 1 FROM front.hebergement h
          WHERE h.hebergement_id = uh.hebergement_id
        ))                                                           AS uh_sans_hebergement,
      (SELECT count(*) FROM front.site
        WHERE NOT EXISTS (
          SELECT 1 FROM front.unite_hebergement uh
          WHERE uh.site_id = front.site.site_id
        ))                                                           AS site_sans_uh,
      (SELECT count(*) FROM front.site_organisme
        WHERE site_id NOT IN (SELECT site_id FROM front.site))       AS so_sans_site
  `);

  const hRow = h.rows[0];
  const hRowAtt = hAttendu.rows[0];
  const c = cibles.rows[0];
  const o = orphans.rows[0];

  console.log("— front.hebergement —");
  console.log(`  total            : ${hRow.total}`);
  console.log(`  supprimés        : ${hRow.supprime}`);
  console.log(`  non supprimés    : ${hRow.non_supprime}`);
  console.log(`  organisme NULL   : ${hRow.organisme_null}`);
  console.log("");

  console.log("— cibles —");
  console.log(`  site                      : ${c.site}`);
  console.log(
    `  unite_hebergement         : ${c.unite_hebergement}  (current=${c.uh_current}, non-current=${c.uh_non_current})`,
  );
  console.log(`  site_organisme            : ${c.site_organisme}`);
  console.log("");

  console.log("— cohérence attendue —");
  const attenduSite = Number(hRowAtt.hebergement_distinct_current);
  const attenduUh = Number(hRow.non_supprime) - Number(hRow.organisme_null);
  console.log(
    `  site attendu            : ${attenduSite}  (hebergement_distinct current=true migrables)`,
  );
  console.log(
    `  unite_hebergement att.  : ${attenduUh}  (non supprimés - organisme null)`,
  );
  console.log(`  hebergement distinct (UH): ${c.uh_hebergement_distinct}`);
  console.log("");

  console.log("— orphelins (doivent être 0) —");
  console.log(`  unite_hebergement sans site     : ${o.uh_sans_site}`);
  console.log(`  unite_hebergement sans heberg    : ${o.uh_sans_hebergement}`);
  console.log(`  site sans unite_hebergement      : ${o.site_sans_uh}`);
  console.log(`  site_organisme sans site         : ${o.so_sans_site}`);
  console.log("");

  const checks = [
    {
      label: `site = site attendu (${attenduSite})`,
      ok: Number(c.site) === attenduSite,
    },
    {
      label: `unite_hebergement = attendu (${attenduUh})`,
      ok: Number(c.unite_hebergement) === attenduUh,
    },
    {
      label: "site = site_organisme (1 organisme par site)",
      ok: Number(c.site) === Number(c.site_organisme),
    },
    {
      label: "unite_hebergement couvre tous les sites",
      ok: Number(c.uh_hebergement_distinct) === Number(c.site),
    },
    {
      label: "aucune unite_hebergement orpheline sans site",
      ok: Number(o.uh_sans_site) === 0,
    },
    {
      label: "aucune unite_hebergement orpheline sans hebergement",
      ok: Number(o.uh_sans_hebergement) === 0,
    },
    {
      label: "aucun site sans unite_hebergement",
      ok: Number(o.site_sans_uh) === 0,
    },
    {
      label: "aucun site_organisme orphelin",
      ok: Number(o.so_sans_site) === 0,
    },
  ];

  let failed = 0;
  checks.forEach((check) => {
    if (check.ok) {
      console.log(`  ✓ ${check.label}`);
    } else {
      failed += 1;
      console.log(`  ✗ ${check.label}`);
    }
  });

  console.log("");
  if (failed === 0) {
    console.log("RÉSULTAT : TOUT EST COHÉRENT ✓");
    process.exitCode = 0;
  } else {
    console.log(`RÉSULTAT : ${failed} incohérence(s) DÉTECTÉE(S) ✗`);
    process.exitCode = 1;
  }

  await knex.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
