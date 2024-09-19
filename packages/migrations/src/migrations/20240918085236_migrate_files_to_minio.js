const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET_KEY,
  },
  endpoint: process.env.S3_BUCKET_ENDPOINT,
  forcePathStyle: true,
  region: process.env.S3_BUCKET_REGION,
});

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = (knex) => {
  return knex
    .withSchema("doc")
    .select()
    .from("documents")
    .then(async (rows) => {
      for (const row of rows) {
        try {
          await s3Client.send(
            new PutObjectCommand({
              Body: row.file,
              Bucket: S3_BUCKET_NAME,
              Key: `${row.uuid}.pdf`,
              Metadata: {
                category: String(row.category),
                created_at: String(row.created_at),
                mimetype: String(row.mime_type),
                originalname: String(row.filename),
              },
            }),
          );
        } catch (err) {
          console.error(`Failed to upload ${row.uuid}:`, err);
        }
      }
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = () => {};
