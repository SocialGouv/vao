// Update with your config settings.

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
    user: process.env.PG_VAO_SUPERUSER,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};
