/* eslint-disable no-unused-vars */
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { StartedS3MockContainer } from "@testcontainers/s3mock";

declare global {
  var postgresContainer: StartedPostgreSqlContainer | undefined;
  var s3Container: StartedS3MockContainer | undefined;
}

export {};
