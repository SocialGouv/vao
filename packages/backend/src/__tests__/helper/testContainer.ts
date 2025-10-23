import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

import { disconnect } from "../../utils/pgpool";
import { disconnect as disconnectDoc } from "../../utils/pgpoolDoc";

const SQL_FILES = ["dump/dump-vao_u-test.sql"];

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
    .withStartupTimeout(30000)
    .start();
  console.timeEnd("StartingPostgres");

  console.time("PostgresInit");
  for (const file of SQL_FILES) {
    await runSqlFile(container, file);
  }
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
