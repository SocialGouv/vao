import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { knex } from "knex";

import { disconnect } from "../../utils/pgpool";
import { disconnect as disconnectDoc } from "../../utils/pgpoolDoc";

// cf lancement.sh
const SQL_FILES = [
  "/scripts/01-init.sql",
  "/scripts/02/02-1-geo-init.sql",
  "/scripts/02/02-2-doc-init.sql",
  "/scripts/02/02-3-back-init.sql",
  "/scripts/02/02-4-front-init.sql",
  "/scripts/02/02-5-ref-init.sql",
  "/scripts/03/03-1-geo-data.sql",
  "/scripts/03/03-2-back-data.sql",
  "/scripts/03/03-3-ref-data.sql",
];

async function runSqlFile(container: StartedPostgreSqlContainer, file: string) {
  console.debug(`runSqlFile[${file}]...`);
  const result = await container.exec([
    "psql",
    "-U",
    container.getUsername(),
    "-d",
    container.getDatabase(),
    "-f",
    `/${file}`,
  ]);
  if (result.exitCode !== 0) {
    console.warn(
      `runSqlFile[KO][${result.exitCode}]`,
      file,
      "output:",
      result.stdout,
    );
    container.stop();
    throw new Error(
      `Failed to initialize Postgres (${file}): ${result.stderr}`,
    );
  }
  return result;
}

async function runMigrations(container: StartedPostgreSqlContainer) {
  console.debug("runMigrations...");

  const db = knex({
    client: "pg",
    connection: {
      database: container.getDatabase(),
      host: container.getHost(),
      password: container.getPassword(),
      port: container.getPort(),
      user: container.getUsername(),
    },
    migrations: {
      directory: "../migrations/src/migrations",
    },
  });
  await db.migrate.latest();
}
export async function createTestContainer() {
  if (global.postgresContainer) {
    console.warn("Postgres container already started");
    return;
  }
  console.time("StartingPostgres");
  const container = await new PostgreSqlContainer("postgres:15.1")
    .withUser("postgres")
    .withUsername("vao_u")
    .withPassword("vao_pwd")
    .withCopyFilesToContainer(
      SQL_FILES.map((file) => ({
        source: `../../pg/${file}`,
        target: `/${file}`,
      })),
    )
    .withStartupTimeout(15000)
    .start();
  console.timeEnd("StartingPostgres");

  console.time("PostgresInit");
  for (const file of SQL_FILES) {
    await runSqlFile(container, file);
  }
  // run migrations
  await runMigrations(container);
  console.timeEnd("PostgresInit");

  console.debug("Postgres initialized successfully");

  global.postgresContainer = container;
}

export async function removeTestContainer() {
  disconnectDoc();
  disconnect();
  if (!global.postgresContainer) {
    console.warn("No Postgres container found");
    return;
  }
  await global.postgresContainer?.stop();
}
