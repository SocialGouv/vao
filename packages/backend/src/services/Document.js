const logger = require("../utils/logger");
const poolDoc = require("../utils/pgpoolDoc").getPool();
const AppError = require("../utils/error");

const {
  S3Client,
  PutObjectCommand,
  // GetObjectCommand,
} = require("@aws-sdk/client-s3");

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const S3_BUCKET_ROOT_DIR = process.env.S3_BUCKET_ROOT_DIR;

const log = logger(module.filename);

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.S3_BUCKET_ACCESS_KEY,
    secretAccessKey: process.env.S3_BUCKET_SECRET_KEY,
  },
  endpoint: process.env.S3_BUCKET_ENDPOINT,
  forcePathStyle: true,
  region: process.env.S3_BUCKET_REGION,
});

const query = {
  create: (category, filename, mime_type, file) => [
    `
      INSERT INTO doc.documents
        (category, filename, mime_type, file)
      VALUES ($1, $2, $3, $4) RETURNING uuid`,
    [category, filename, mime_type, file],
  ],
  getByUuid: (uuid) => [
    `
      SELECT uuid,
             category,
             filename,
             mime_type as mimeType,
             file
      FROM doc.documents
      WHERE uuid = $1;`,
    [uuid],
  ],
  getFileMetaData: (uuid) => [
    `
    SELECT
      uuid,
      filename as "name",
      created_at as "createdAt"
    FROM doc.documents
    WHERE uuid = $1;`,
    [uuid],
  ],
};

module.exports.getFile = async (uuid) => {
  log.i("IN");
  try {
    const { rows, rowCount } = await poolDoc.query(...query.getByUuid(uuid));
    if (rowCount > 0) {
      log.i("DONE", rows[0]);
      return rows[0];
    }
    log.i("DONE");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getByUuid failed", { cause: err });
  }
};

module.exports.getFileMetaData = async (uuid) => {
  log.i("IN");
  try {
    const { rows, rowCount } = await poolDoc.query(
      ...query.getFileMetaData(uuid),
    );
    if (rowCount > 0) {
      log.i("DONE", rows[0]);
      return rows[0];
    }
    log.i("DONE");
    return null;
  } catch (err) {
    log.w(err);
    throw new AppError("query.getFileMetaData failed", { cause: err });
  }
};

module.exports.createFile = async (filename, category, mimetype, data) => {
  log.i("createFile pg - In");
  try {
    log.i("createFile pg", { category, filename, mimetype });
    const {
      rows: [{ uuid }],
    } = await poolDoc.query(
      ...query.create(category, filename, mimetype, data),
    );
    log.i("createFile pg - Done");
    log.i("upload file to s3");
    await uploadToS3(filename, category, mimetype, data, uuid);
    log.i("upload file to s3 - Done");
    return uuid;
  } catch (err) {
    log.w(err);
    throw new AppError("createFile pg failed", { cause: err });
  }
};

module.exports.getStatic = async (name) => {
  log.i("getOrganisateurAvecUnRetrait - In");
  return `${__dirname}/static/${name}`;
};

async function uploadToS3(
  filename,
  category,
  mimetype,
  data,
  uuid = crypto.randomUUID(),
) {
  log.i("uploadToS3 - In");
  try {
    log.d("uploadToS3", category, filename);
    const encodedFilename = Buffer.from(filename, "latin1").toString("base64");
    await s3Client.send(
      new PutObjectCommand({
        Body: data,
        Bucket: S3_BUCKET_NAME,
        Key: `${S3_BUCKET_ROOT_DIR}/${uuid}.pdf`,
        Metadata: {
          category,
          created_at: String(new Date()),
          mimetype: mimetype,
          originalname: encodedFilename,
        },
      }),
    );
    log.i("uploadToS3 - Done");
  } catch (err) {
    log.w(err);
    throw new AppError("upload failed", { cause: err });
  }
}

// // -- next migration step: read files from S3
// async function downloadFromS3(uuid) {
//   log.i("IN");
//   try {
//     const data = await s3Client.send(
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `${S3_BUCKET_ROOT_DIR}/${uuid}.pdf`,
//       }),
//     );
//     log.i("DONE");
//     return data;
//   } catch (err) {
//     log.w(err);
//     throw new AppError("query.getByUuid failed", { cause: err });
//   }
// }
