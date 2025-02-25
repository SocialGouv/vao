import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { randomUUID } from "crypto";
import { Pool } from "pg";

import { FileService } from "./file.service";

describe("FileController", () => {
  let service: FileService;
  let pool: Pool;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: "PG_CONNECTION_DOC",
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: "S3_CLIENT",
          useValue: {
            send: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation((key: "s3.bucketName" | "s3.rootDir") => {
                const mockConfig = {
                  "s3.bucketName": "mock-bucket",
                  "s3.rootDir": "mock-root",
                };
                return mockConfig[key];
              }),
          },
        },
      ],
    }).compile();

    service = module.get(FileService);
    pool = module.get("PG_CONNECTION_DOC");
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(pool).toBeDefined();
  });

  describe("getMetaDataFileFromDB", () => {
    it("should return metadata for a valid UUID", async () => {
      const uuid = randomUUID();
      const metadata = {
        category: "default",
        filename: "test.pdf",
        mimeType: "application/pdf",
        userId: 123,
        uuid,
      };

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [metadata] });

      const result = await service.getMetaDataFileFromDB(uuid);
      expect(pool.query).toHaveBeenCalledWith(
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
      expect(result).toEqual(metadata);
    });

    it("should return null if no metadata is found", async () => {
      const uuid = randomUUID();

      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

      const result = await service.getMetaDataFileFromDB(uuid);
      expect(result).toBeNull();
    });
  });

  describe("getMetaDataFile", () => {
    it("should call getMetaDataFileFromDB and return metadata", async () => {
      const uuid = randomUUID();
      const metadata = {
        category: "default",
        filename: "test.pdf",
        mimeType: "application/pdf",
        userId: 123,
        uuid,
      };

      jest
        .spyOn(service, "getMetaDataFileFromDB")
        .mockResolvedValueOnce(metadata);

      const result = await service.getMetaDataFile(uuid);
      expect(service.getMetaDataFileFromDB).toHaveBeenCalledWith(uuid);
      expect(result).toEqual(metadata);
    });

    it("should return null if no metadata is found", async () => {
      const uuid = randomUUID();

      jest.spyOn(service, "getMetaDataFileFromDB").mockResolvedValueOnce(null);

      const result = await service.getMetaDataFile(uuid);
      expect(result).toBeNull();
    });
  });

  describe("uploadFileToDB", () => {
    it("should insert file metadata into the database and return UUID", async () => {
      const file = {
        category: "default",
        data: Buffer.from("file content"),
        filename: "test.pdf",
        mimetype: "application/pdf",
      };
      const userId = 123;
      const uuid = randomUUID();

      (pool.query as jest.Mock).mockResolvedValueOnce({
        rows: [{ uuid }],
      });

      const result = await service.uploadFileToDB(file, userId);
      expect(pool.query).toHaveBeenCalledWith(
        `
      INSERT INTO doc.documents
        (category, filename, mime_type, user_id, file)
      VALUES ($1, $2, $3, $4, $5) RETURNING uuid
      `,
        [file.category, file.filename, file.mimetype, userId, file.data],
      );
      expect(result).toBe(uuid);
    });
  });

  describe("uploadFile", () => {
    it("should call uploadFileToDB and return a UUID", async () => {
      const file = {
        category: "default",
        data: Buffer.from("file content"),
        filename: "test.pdf",
        mimetype: "application/pdf",
      };
      const userId = 123;
      const uuid = randomUUID();

      jest.spyOn(service, "uploadFileToDB").mockResolvedValueOnce(uuid);

      const result = await service.uploadFile(file, userId);
      expect(service.uploadFileToDB).toHaveBeenCalledWith(file, userId);
      expect(result).toBe(uuid);
    });
  });
});
