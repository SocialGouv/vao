import {
  type S3Client,
  HeadObjectCommand,
  PutObjectCommand,
  S3ServiceException,
} from "@aws-sdk/client-s3";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID, UUID } from "crypto";
import { type Pool } from "pg";
import type { User } from "src/schemas/user.schema";

import { encodeFilename, getFileNameAndExtension } from "../helpers/file";
import { parseData } from "../lib/zodHelper";
import { MetaDataSchema } from "../schemas/file.schema";
import { UUIDSchema } from "../schemas/uuid.schema";

@Injectable()
export class FileService {
  constructor(
    @Inject("PG_CONNECTION_DOC") private readonly db: Pool,
    @Inject("S3_CLIENT") private readonly s3Client: S3Client,
    private configService: ConfigService,
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
    this.logger.log("File upload started", { userId });
    const uuid = await this.uploadFileToDB(file, userId);
    await this.uploadFileToS3(file, uuid, userId);
    this.logger.log("File upload ended", { userId });
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
    const { name, extension } = getFileNameAndExtension(file.filename);
    const encodedFilename = encodeFilename(name);
    await this.s3Client.send(
      new PutObjectCommand({
        Body: file.data,
        Bucket: this.configService.get("s3.bucketName"),
        Key: `${this.configService.get("s3.rootDir")}/${uuid}`,
        Metadata: {
          category: file.category,
          created_at: new Date().toISOString(),
          extension,
          mimetype: file.mimetype,
          originalname: encodedFilename,
          userId: `${userId}`,
        },
      }),
    );
    return uuid;
  }

  async getMetaDataFile(uuid: UUID) {
    this.logger.log("MetaData get started");
    await this.getMetaDataFileFromS3(uuid);
    const metaData = await this.getMetaDataFileFromDB(uuid);
    this.logger.log("MetaData get ended");
    return metaData;
  }

  async getMetaDataFileFromS3(uuid: UUID) {
    try {
      const data = await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.configService.get("s3.bucketName"),
          Key: `${this.configService.get("s3.rootDir")}/${uuid}`,
        }),
      );
      this.logger.log("MetaData get ended");
      return data;
    } catch (error) {
      if (error instanceof S3ServiceException) {
        if (
          error.name === "NotFound" ||
          error.$metadata?.httpStatusCode === 404
        )
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
