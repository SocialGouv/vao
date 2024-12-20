import {
  type S3Client,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { randomUUID, UUID } from "crypto";
import { type Pool } from "pg";
import type { User } from "src/schemas/user.schema";

import { s3 } from "../config";
import { parseData } from "../lib/zodHelper";
import { MetaDataSchema } from "../schemas/file.schema";
import { UUIDSchema } from "../schemas/uuid.schema";

@Injectable()
export class FileService {
  constructor(
    @Inject("PG_CONNECTION_DOC") private readonly db: Pool,
    @Inject("S3_CLIENT") private readonly s3Client: S3Client,
  ) {}
  private readonly logger = new Logger(FileService.name);

  async uploadFile(
    file: {
      filename: string;
      category: string;
      mimetype: string;
      data: Buffer;
    },
    userId: User["id"],
  ): Promise<UUID> {
    const uuid = await this.uploadFileToDB(file, userId);
    // await this.uploadFileToS3(file, uuid, userId);
    return uuid;
  }

  async uploadFileToDB(
    file: {
      filename: string;
      category: string;
      mimetype: string;
      data: Buffer;
    },
    userId: User["id"],
  ): Promise<UUID> {
    const {
      rows: [{ uuid }],
    } = await this.db.query(
      `
      INSERT INTO doc.documents
        (category, filename, mime_type, user_id, file)
      VALUES ($1, $2, $3, $4, $5) RETURNING uuid
      `,
      [file.category, file.filename, file.mimetype, userId, file.data],
    );
    try {
      return parseData(uuid, UUIDSchema) as UUID;
    } catch (error) {
      this.logger.error(uuid);
      throw error;
    }
  }

  async uploadFileToS3(
    file: {
      filename: string;
      category: string;
      mimetype: string;
      data: Buffer;
    },
    uuid = randomUUID(),
    userId: User["id"],
  ): Promise<UUID> {
    const encodedFilename = Buffer.from(file.filename, "latin1").toString(
      "base64",
    );
    await this.s3Client.send(
      new PutObjectCommand({
        Body: file.data,
        Bucket: s3.bucketName,
        Key: `${s3.rootDir}/${uuid}.pdf`,
        Metadata: {
          category: file.category,
          created_at: String(new Date()),
          mimetype: file.mimetype,
          originalname: encodedFilename,
          userId: `${userId}`,
        },
      }),
    );
    return uuid;
  }

  async getMetaDataFile(uuid: UUID) {
    // await this.getMetaDataFileFromS3(uuid);
    return await this.getMetaDataFileFromDB(uuid);
  }

  async getMetaDataFileFromS3(uuid: UUID) {
    try {
      const data = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: s3.bucketName,
          Key: `${s3.rootDir}/${uuid}`,
        }),
      );
      return data;
    } catch (error) {
      if (
        error.name === "NotFound" ||
        error.$metadata?.httpStatusCode === 404
      ) {
        return null;
      }
      throw error;
    }
  }

  async getMetaDataFileFromDB(uuid: UUID) {
    const { rows } = await this.db.query(
      `
      SELECT uuid,
        category,
        filename,
        mime_type as "mimeType",
        user_id as "userId"
      FROM doc.documents
      WHERE uuid = $1;
      `,
      [uuid],
    );
    if (!rows[0]) {
      return null;
    }
    try {
      return parseData(rows[0], MetaDataSchema);
    } catch (error) {
      this.logger.error(uuid);
      throw error;
    }
  }
}
