import * as Sentry from "@sentry/node";
import { migrateFilesToS3, s3, sentry } from "../config";
import { insertCron } from "../cron/cron.service";
import { poolDoc } from "../db/poolDoc";
import { logger } from "../utils/logger";
import { objectExists, uploadDocumentToS3 } from "../utils/s3";
import type {
  DocumentToMigrateRow,
  MigrateFilesToS3Report,
} from "./migrateFilesToS3.type";

const querySelectDocumentsToMigrate = `
  SELECT uuid, category, filename, mime_type, user_id, created_at, file
  FROM doc.documents
  WHERE s3_uploaded_at IS NULL
  ORDER BY created_at ASC
  LIMIT $1
`;

const queryMarkAsUploaded = `
  UPDATE doc.documents
  SET s3_uploaded_at = NOW()
  WHERE uuid = $1
`;

const markAsUploaded = async (uuid: string) => {
  await poolDoc.query(queryMarkAsUploaded, [uuid]);
};

const migrateDocument = async (
  row: DocumentToMigrateRow,
  report: MigrateFilesToS3Report,
) => {
  const objectKey = `${s3.rootDir}/${row.uuid}`;

  if (await objectExists(objectKey)) {
    await markAsUploaded(row.uuid);
    report.alreadyInS3 += 1;
    return;
  }

  await uploadDocumentToS3({
    category: row.category,
    createdAt: row.created_at,
    file: row.file,
    filename: row.filename,
    mimeType: row.mime_type,
    userId: row.user_id,
    uuid: row.uuid,
  });
  await markAsUploaded(row.uuid);
  report.uploaded += 1;
};

export const migrateFilesToS3Action = async () => {
  logger.info(`${migrateFilesToS3.name} - Start`);
  const startDate = new Date();
  const report: MigrateFilesToS3Report = {
    alreadyInS3: 0,
    errorDetails: [],
    errors: 0,
    total: 0,
    uploaded: 0,
  };

  try {
    const { rows } = await poolDoc.query<DocumentToMigrateRow>(
      querySelectDocumentsToMigrate,
      [migrateFilesToS3.batchSize],
    );
    report.total = rows.length;

    if (rows.length === 0) {
      logger.info(`${migrateFilesToS3.name} - Nothing to migrate`);
      await insertCron({
        cronName: migrateFilesToS3.name,
        endDate: new Date(),
        report,
        startDate,
      });
      logger.info(`${migrateFilesToS3.name} - End`);
      return;
    }

    for (const row of rows) {
      try {
        await migrateDocument(row, report);
      } catch (error) {
        report.errors += 1;
        report.errorDetails.push({
          error: error instanceof Error ? error.message : error,
          uuid: row.uuid,
        });
        logger.error(
          { err: error, uuid: row.uuid },
          `${migrateFilesToS3.name} - Failed to migrate document`,
        );
        if (sentry.enabled) {
          Sentry.captureException(error);
        }
      }
    }

    await insertCron({
      cronName: migrateFilesToS3.name,
      endDate: new Date(),
      report,
      startDate,
    });
    logger.info(
      {
        alreadyInS3: report.alreadyInS3,
        errors: report.errors,
        total: report.total,
        uploaded: report.uploaded,
      },
      `${migrateFilesToS3.name} - End`,
    );
  } catch (error) {
    if (sentry.enabled) {
      Sentry.captureException(error);
    }
    logger.error(error);
    throw error;
  }
};
