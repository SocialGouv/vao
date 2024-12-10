import {
  type S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Inject, Injectable } from "@nestjs/common";
import { randomUUID, UUID } from "crypto";
import { type Pool } from "pg";
import type { User } from "src/schemas/user.schema";

import { s3 } from "../config";
import { parseData } from "../lib/zodHelper";
import { UUIDSchema } from "../schemas/uuid.schema";

@Injectable()
export class FileService {
  constructor(
    @Inject("PG_CONNECTION") private readonly db: Pool,
    @Inject("S3_CLIENT") private readonly s3Client: S3Client,
  ) {}

  async uploadFile(
    file: {
      filename: string;
      category: string;
      mimetype: string;
      data: Buffer;
    },
    userId: User["id"],
  ): Promise<UUID> {
    const uuid = await this.uploadFileToDB(file);
    await this.uploadFileToS3(file, uuid, userId);
    return uuid;
  }

  async uploadFileToDB(file: {
    filename: string;
    category: string;
    mimetype: string;
    data: Buffer;
  }): Promise<UUID> {
    const {
      rows: [{ uuid }],
    } = await this.db.query(
      `
      INSERT INTO doc.documents
        (category, filename, mime_type, file)
      VALUES ($1, $2, $3, $4) RETURNING uuid
      `,
      [file.category, file.filename, file.mimetype, file.data],
    );

    return parseData(uuid, UUIDSchema) as UUID;
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

  async getFile() {}

  async getMetaDataFileFromS3(uuid: UUID) {
    const data = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${s3.rootDir}/${uuid}.pdf`,
      }),
    );
    return data;
  }

  async getMetaDataFileFromDB(uuid: UUID) {
    const { rows } = await this.db.query(
      `
      SELECT uuid,
        category,
        filename,
        mime_type as mimeType,
      FROM doc.documents
      WHERE uuid = $1;
      `,
      [uuid],
    );
    if (!rows[0]) {
      return null;
    }
    return parseData(rows[0], UUIDSchema);
  }
}
