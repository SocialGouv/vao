const {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");
const { read } = require("fs");

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
    if (rowId > 20) {
      break;
    }
    console.log(`Processing row ${rowId} of ${nbRows} ; nbErrors: ${nbErrors}`);
    const objectKey = `${S3_BUCKET_ROOT_DIR}/${row.uuid}.pdf`;
    // try {
    //   // Check if the file already exists
    //   await s3Client.send(
    //     new HeadObjectCommand({
    //       Bucket: S3_BUCKET_NAME,
    //       Key: objectKey,
    //     }),
    //   );
    //   // If the file exists, log it and skip the upload
    //   console.log(`File ${objectKey} already exists. Skipping upload.`);
    //   continue;
    // } catch (err) {
    // If a 404 error occurs, the file doesn't exist, proceed with upload
    //   if (err.name === "NotFound") {
    try {
      const reencodedFileName = Buffer.from(row.filename, "latin1").toString(
        "utf8",
      );
      const metadata = {
        category: String(row.category),
        created_at: String(row.created_at),
        mimetype: String(row.mime_type),
        originalname: reencodedFileName,
      };
      console.log("metadata", metadata);
      console.log("row", row);
      // Upload the file since it doesn't exist
      await s3Client.send(
        new PutObjectCommand({
          Body: row.file,
          Bucket: S3_BUCKET_NAME,
          //   ContentType: "application/octet-stream",
          Key: objectKey,
          Metadata: metadata,
        }),
      );
      console.log(`Uploaded ${objectKey}`);
    } catch (uploadErr) {
      console.error(`Failed to upload ${objectKey}:`, uploadErr);
      nbErrors++;
      continue;
      //   process.exit(1);
    }
    //   } else {
    //     // If the error isn't a 404, throw it to handle other failures
    //     console.error(`Error checking existence of ${objectKey}:`, err);
    //     process.exit(1);
    //   }
    // }
  }

  console.log("Migration complete");
  process.exit(0);
}

async function readS3Meta() {
  const uuid = "0ee60561-3366-40f6-b3fc-485e6e74ae41";
  const data = await s3Client.send(
    new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${S3_BUCKET_ROOT_DIR}/${uuid}.pdf`,
    }),
  );
  console.log(data.Metadata);
}

// readS3Meta();
main();
