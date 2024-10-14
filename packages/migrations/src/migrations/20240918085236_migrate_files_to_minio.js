const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3");

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_BUCKET_ROOT_DIR = process.env.S3_BUCKET_ROOT_DIR;

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
  // console.log("Migrating files to S3");
  // console.log("S3_BUCKET_NAME", S3_BUCKET_NAME);
  // console.log("S3_BUCKET_ROOT_DIR", S3_BUCKET_ROOT_DIR);
  // return knex
  //   .withSchema("doc")
  //   .select()
  //   .from("documents")
  //   .then(async (rows) => {
  //     for (const row of rows) {
  //       const objectKey = `${S3_BUCKET_ROOT_DIR}/${row.uuid}.pdf`;
  //       try {
  //         // Check if the file already exists
  //         await s3Client.send(
  //           new HeadObjectCommand({
  //             Bucket: S3_BUCKET_NAME,
  //             Key: objectKey,
  //           }),
  //         );
  //         // If the file exists, log it and skip the upload
  //         console.log(`File ${objectKey} already exists. Skipping upload.`);
  //         continue;
  //       } catch (err) {
  //         // If a 404 error occurs, the file doesn't exist, proceed with upload
  //         if (err.name === "NotFound") {
  //           try {
  //             // Upload the file since it doesn't exist
  //             await s3Client.send(
  //               new PutObjectCommand({
  //                 Body: row.file,
  //                 Bucket: S3_BUCKET_NAME,
  //                 Key: objectKey,
  //                 Metadata: {
  //                   category: String(row.category),
  //                   created_at: String(row.created_at),
  //                   mimetype: String(row.mime_type),
  //                   originalname: String(row.filename),
  //                 },
  //               }),
  //             );
  //             console.log(`Uploaded ${objectKey}`);
  //           } catch (uploadErr) {
  //             console.error(`Failed to upload ${objectKey}:`, uploadErr);
  //             throw uploadErr;
  //           }
  //         } else {
  //           // If the error isn't a 404, throw it to handle other failures
  //           console.error(`Error checking existence of ${objectKey}:`, err);
  //           throw err;
  //         }
  //       }
  //     }
  //   })
  //   .catch((err) => {
  //     // Catch the error and rethrow it to ensure the migration fails
  //     console.error("Migration failed:", err);
  //     throw err;
  //   });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = () => {};
