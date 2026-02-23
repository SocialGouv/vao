import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { StartedS3MockContainer } from "@testcontainers/s3mock";

declare global {
  // eslint-disable-next-line no-var -- required for global augmentation
  var postgresContainer: StartedPostgreSqlContainer | undefined;
  // eslint-disable-next-line no-var -- required for global augmentation
  var s3Container: StartedS3MockContainer | undefined;
}

export {};
