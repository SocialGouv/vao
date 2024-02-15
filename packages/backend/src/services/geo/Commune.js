/* eslint-disable no-param-reassign */
const format = require("pg-format");
const logger = require("../../utils/logger");
const pool = require("../../utils/pgpool").getPool();

const log = logger(module.filename);

const query = {
  select: ({ query: q, values }) =>
    format(
      `
      SELECT 
        geo_com_code_fijais as value,
        geo_com_label as text,
        geo_com_date_debut as "dateDebut",
        geo_com_date_fin as "dateFin"
      FROM geo.communes
      WHERE 1=1 
      ${q}
      ORDER BY geo_com_label ASC
      `,
      ...values,
    ),
  selectWithDep: (criterias) => [
    `
      SELECT 
        geo_com_code_fijais as value,
        geo_com_label as text,
        geo_com_date_debut as "dateDebut",
        geo_com_date_fin as "dateFin",
        c.geo_ter_code,
        t.geo_ter_label
      FROM geo.communes c
      JOIN geo.territoires t on t.geo_ter_code = c.geo_ter_code
      WHERE 1=1 
      ${Object.keys(criterias)
        .filter(
          (criteria) =>
            (Array.isArray(criterias[criteria]) &&
              criterias[criteria].length > 0) ||
            (!Array.isArray(criterias[criteria]) &&
              criterias[criteria] !== null &&
              criterias[criteria] !== undefined &&
              criterias[criteria] !== ""),
        )
        .map((criteria, i) => ` AND ${criteria} = $${i + 1}`)
        .join(" ")}
      ORDER BY geo_com_label ASC
      `,
    Object.values(criterias),
  ],
};

const dict = {
  code: (code) => `
    AND geo_com_code_fijais IN (${format.literal(code)})`,
  date: (date) => `
    AND (
      TO_DATE(${format.literal(
        date,
      )}, 'YYYY-MM-DD') >= geo_com_date_debut OR geo_com_date_debut is null
    )
    AND (
      geo_com_date_fin > TO_DATE(${format.literal(
        date,
      )}, 'YYYY-MM-DD') OR geo_com_date_fin is null
    )`,
  departement: (departement) => `
    AND geo_ter_code = ${format.literal(departement)}`,
};

const transpose = (search) =>
  Object.entries(search)
    .filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== "" &&
        (!Array.isArray(value) || value.length > 0),
    )
    .reduce(
      (memo, [key, value]) => {
        if (dict[key]) {
          memo.query += dict[key](value);
        } else {
          const isArray = Array.isArray(value);
          const newKey = dict[key] ? dict[key] : key;
          memo.query += ` AND ${newKey} ${isArray ? "IN (" : "="} %L ${
            isArray ? ")" : ""
          }`;
          memo.values.push(value);
        }
        return memo;
      },
      {
        query: "",
        values: [],
      },
    );

module.exports.fetch = async (criterias = {}) => {
  log.i("fetch - IN");

  const tFilters = transpose(criterias);

  const { rows } = await pool.query(query.select(tFilters));
  log.i("fetch - DONE");
  return rows;
};

module.exports.get = async (criterias) => {
  log.i("get - IN");
  const tFilters = transpose(criterias);

  const { rows, rowCount } = await pool.query(query.select(tFilters));
  log.i("get - DONE");
  if (rowCount === 1) {
    return rows[0];
  }
  return null;
};

module.exports.fetchWithDep = async (criterias = {}) => {
  log.i("fetchWithDep - IN");
  const fetch = await pool.query(...query.selectWithDep(criterias));
  log.i("fetchWithDep - DONE");
  return fetch.rows;
};
