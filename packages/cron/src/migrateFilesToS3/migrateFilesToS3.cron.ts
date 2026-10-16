import { createCron } from "../cron/cron.service";
import { migrateFilesToS3 } from "../config";
import { migrateFilesToS3Action } from "./migrateFilesToS3.service";

export const cronMigrateFilesToS3 = () =>
  createCron(
    migrateFilesToS3.cron,
    migrateFilesToS3.name,
    migrateFilesToS3Action,
  );
