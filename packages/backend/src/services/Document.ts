import path from "node:path";
import { Readable } from "node:stream";

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import * as Sentry from "@sentry/node";
import { DocumentDto, FileMetaDataDto } from "@vao/shared-bridge";

import AppError from "../utils/error";
import {
  encodeFilename,
  getFileNameAndExtension,
  streamToBuffer,
} from "../utils/file";
import logger from "../utils/logger";
import { getPool as getPoolDoc } from "../utils/pgpoolDoc";

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_BUCKET_ROOT_DIR = process.env.S3_BUCKET_ROOT_DIR;

const log = logger(module.filename);

const getS3Client = () => {
  if (process.env.NODE_ENV === "test") {
    if (!global.s3Container) {
      throw new Error("No S3 container found");
    }
    return new S3Client({
      credentials: {
        accessKeyId: global.s3Container.getAccessKeyId(),
        secretAccessKey: global.s3Container.getSecretAccessKey(),
      },
      endpoint: global.s3Container?.getHttpConnectionUrl(),
      forcePathStyle: true,
      region: "auto",
    });
  }

  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.S3_BUCKET_ACCESS_KEY!,
      secretAccessKey: process.env.S3_BUCKET_SECRET_KEY!,
    },
    endpoint: process.env.S3_BUCKET_ENDPOINT,
    forcePathStyle: true,
    region: process.env.S3_BUCKET_REGION!,
  });

  return s3Client;
};

const query = {
  create: (
    category: string,
    filename: string,
    mime_type: string,
    userId: string | number,
    file: Buffer,
  ) => [
    `
      INSERT INTO doc.documents
        (category, filename, mime_type, user_id, file)
      VALUES ($1, $2, $3, $4, $5) RETURNING uuid`,
    [category, filename, mime_type, userId, file],
  ],
  getByUuid: (uuid: string) => [
    `
      SELECT uuid,
        category,
        filename,
        mime_type as "mimeType",
        user_id as "userId",
        file
      FROM doc.documents
      WHERE uuid = $1;`,
    [uuid],
  ],
  getFileMetaData: (uuid: string) => [
    `
    SELECT
      uuid,
      filename as "name",
      user_id as "userId",
      created_at as "createdAt"
    FROM doc.documents
    WHERE uuid = $1;`,
    [uuid],
  ],
};

export const getFile = async (uuid: string): Promise<DocumentDto | null> => {
  const fileS3 = await getFileS3(uuid);
  if (fileS3?.Body) {
    const file = await streamToBuffer(fileS3.Body as Readable);
    return {
      category: fileS3.Metadata?.category as string,
      file,
      filename: fileS3.Metadata?.originalname as string,
      mimeType: fileS3.Metadata?.mimetype as string,
      userId: fileS3.Metadata?.userid as string,
      uuid,
    };
  }
  log.w("File not found in S3, trying to get from database");
  return getFileEntity(uuid);
};

export const getFileEntity = async (
  uuid: string,
): Promise<DocumentDto | null> => {
  log.i("IN getFileEntity");
  try {
    const { rows, rowCount } = await getPoolDoc().query(
      ...query.getByUuid(uuid),
    );
    const typedRows = rows as DocumentDto[];
    if (rowCount != null && rowCount > 0) {
      log.i("DONE getFileEntity", typedRows[0]);
      return typedRows[0];
    }
    log.i("DONE getFileEntity");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getByUuid failed", { cause: err });
  }
};

// // -- next migration step: read files from S3
export const getFileS3 = async (uuid: string) => {
  log.i("IN getFileS3");
  try {
    const data = await getS3Client().send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${S3_BUCKET_ROOT_DIR}/${uuid}`,
      }),
    );
    log.i("DONE getFileS3", data?.Metadata);
    return data;
  } catch (err) {
    log.w(err);
    Sentry.setContext("document", {
      uuid,
    });
    Sentry.captureException(err);
    // TODO: throw an error when files removed form database
    return null;
  }
};

export const getFileMetaData = async (
  uuid: string,
): Promise<FileMetaDataDto | null> => {
  log.i("IN getFileMetaData");
  try {
    const results = await getPoolDoc().query(...query.getFileMetaData(uuid));
    const rows = results.rows as FileMetaDataDto[];
    if (results.rowCount != null && results.rowCount > 0) {
      log.i("DONE getFileMetaData", rows[0]);
      return rows[0];
    }
    log.i("DONE getFileMetaData");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getFileMetaData failed", { cause: err });
  }
};

export const createFile = async (
  filename: string,
  category: string,
  mimetype: string,
  data: Buffer,
  userid: string | number,
): Promise<string> => {
  log.i("createFile pg - In");
  try {
    log.i("createFile pg", { category, filename, mimetype });
    const { rows } = await getPoolDoc().query(
      ...query.create(category, filename, mimetype, userid, data),
    );
    const uuid = (rows as { uuid: string }[])[0].uuid;
    log.i("createFile pg - Done");
    log.i("upload file to s3");
    await uploadToS3(filename, category, mimetype, userid, data, uuid);
    log.i("upload file to s3 - Done");
    return uuid;
  } catch (err) {
    log.w(err);
    throw new AppError("createFile pg failed", { cause: err });
  }
};

export const getStaticFile = (name: string, directory: string): string => {
  const publicDir = path.resolve(__dirname, "../../assets", directory);
  const filePath = path.resolve(publicDir, name);

  if (!filePath.startsWith(publicDir + path.sep)) {
    throw new AppError("Invalid file path", { cause: "Invalid file path" });
  }
  return filePath;
};

async function uploadToS3(
  filename: string,
  category: string,
  mimetype: string,
  userid: string | number,
  data: Buffer,
  uuid: string,
): Promise<void> {
  log.i("uploadToS3 - In");
  try {
    log.d("uploadToS3", category, filename);
    const { name, extension } = getFileNameAndExtension(filename);

    const encodedFilename = encodeFilename(name);

    await getS3Client().send(
      new PutObjectCommand({
        Body: data,
        Bucket: S3_BUCKET_NAME,
        Key: `${S3_BUCKET_ROOT_DIR}/${uuid}`,
        Metadata: {
          category,
          created_at: new Date().toISOString(),
          extension,
          mimetype,
          originalname: encodedFilename,
          userid: `${userid}`,
        },
      }),
    );
    log.i("uploadToS3 - Done");
  } catch (err) {
    log.w(err);
    throw new AppError("uploadToS3 failed", { cause: err });
  }
}
