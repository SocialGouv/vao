/* eslint-disable no-param-reassign */
const format = require("pg-format");
const logger = require("../../utils/logger");
const { getPool } = require("../../utils/pgpool");

const log = logger(module.filename);

const query = {
  select: ({ query: q, values }) =>
    format(
      `
      SELECT
        code as value,
        label as text,
        date_debut as "dateDebut",
        date_fin as "dateFin"
      FROM geo.communes
      WHERE 1=1
      ${q}
      ORDER BY label ASC
      `,
      ...values,
    ),
  selectWithDep: (criterias) => [
    `
      SELECT
        code as value,
        label as text,
        date_debut as "dateDebut",
        date_fin as "dateFin",
        c.code,
        t.label
      FROM geo.communes c
      JOIN geo.territoires t on t.code = c.code
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
      ORDER BY label ASC
      `,
    Object.values(criterias),
  ],
};

const dict = {
  code: (code) => `
    AND code IN (${format.literal(code)})`,
  date: (date) => `
    AND (
      TO_DATE(${format.literal(
        date,
      )}, 'YYYY-MM-DD') >= date_debut OR date_debut is null
    )
    AND (
      date_fin > TO_DATE(${format.literal(
        date,
      )}, 'YYYY-MM-DD') OR date_fin is null
    )`,
  departement: (departement) => `
    AND code = ${format.literal(departement)}`,
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

  const { rows } = await getPool().query(query.select(tFilters));
  log.i("fetch - DONE");
  return rows;
};

module.exports.get = async (criterias) => {
  log.i("get - IN");
  const tFilters = transpose(criterias);

  const { rows, rowCount } = await getPool().query(query.select(tFilters));
  log.i("get - DONE");
  if (rowCount === 1) {
    return rows[0];
  }
  return null;
};

module.exports.fetchWithDep = async (criterias = {}) => {
  log.i("fetchWithDep - IN");
  const fetch = await getPool().query(...query.selectWithDep(criterias));
  log.i("fetchWithDep - DONE");
  return fetch.rows;
};
