const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const knex = require("knex")({
  client: "pg",
  connection: {
    database: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    password: process.env.PG_VAO_SUPERPASSWORD,
    port: process.env.POSTGRES_PORT,
    ssl: process.env.PGSSLMODE
      ? {
          rejectUnauthorized: false, // to authorize CNPG self-signed certificates
        }
      : false,
    user: process.env.PG_VAO_SUPERUSER,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_BUCKET_ROOT_DIR = process.env.S3_BUCKET_ROOT_DIR;

const s3Client = new S3Client({
  correctClockSkew: true,
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET_KEY,
  },
  endpoint: process.env.S3_BUCKET_ENDPOINT,
  forcePathStyle: true,
  region: process.env.S3_BUCKET_REGION,
  signatureVersion: "v4",
});

async function main() {
  console.log("Migrating files to S3");
  console.log("S3_BUCKET_NAME", S3_BUCKET_NAME);
  console.log("S3_BUCKET_ROOT_DIR", S3_BUCKET_ROOT_DIR);

  const results = await knex.withSchema("doc").count().from("documents");
  const nbRows = results[0].count;
  console.log(`Found ${nbRows} documents to migrate`);

  const stream = knex.withSchema("doc").select().from("documents").stream();

  let rowId = 0;
  let nbErrors = 0;

  for await (const row of stream) {
    rowId++;
    console.log(
      `Processing row ${rowId} of ${nbRows} ; nbErrors: ${nbErrors} ; uuid=${row.uuid}`,
    );
    const objectKey = `${S3_BUCKET_ROOT_DIR}/${row.uuid}.pdf`;

    try {
      const reencodedFileName = Buffer.from(row.filename, "latin1").toString(
        "base64",
      );

      const metadata = {
        category: String(row.category),
        created_at: String(row.created_at),
        mimetype: String(row.mime_type),
        originalname: reencodedFileName,
      };

      await s3Client.send(
        new PutObjectCommand({
          Body: row.file,
          Bucket: S3_BUCKET_NAME,
          Key: objectKey,
          Metadata: metadata,
        }),
      );
    } catch (uploadErr) {
      console.error(`Failed to upload ${objectKey}:`, uploadErr);
      nbErrors++;
    }
  }

  console.log("Migration complete");
  process.exit(0);
}

main();
