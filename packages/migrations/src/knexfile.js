/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
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
  migrations: {
    directory: "./migrations",
    tableName: "knex_migrations",
  },
};
