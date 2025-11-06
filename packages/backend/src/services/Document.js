const { encodeFilename, getFileNameAndExtension } = require("../utils/file");
const logger = require("../utils/logger");
const { getPool: getPoolDoc } = require("../utils/pgpoolDoc");
const AppError = require("../utils/error");
const path = require("node:path");

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
  create: (category, filename, mime_type, userId, file) => [
    `
      INSERT INTO doc.documents
        (category, filename, mime_type, user_id, file)
      VALUES ($1, $2, $3, $4, $5) RETURNING uuid`,
    [category, filename, mime_type, userId, file],
  ],
  getByUuid: (uuid) => [
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
  getFileMetaData: (uuid) => [
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

module.exports.getFile = async (uuid) => {
  log.i("IN");
  try {
    const { rows, rowCount } = await getPoolDoc().query(
      ...query.getByUuid(uuid),
    );
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

// // -- next migration step: read files from S3
// module.exports.getFile = async (uuid) => {
//   log.i("IN");
//   try {
//     const data = await s3Client.send(
//       new GetObjectCommand({
//         Bucket: process.env.S3_BUCKET_NAME,
//         Key: `${S3_BUCKET_ROOT_DIR}/${uuid}`,
//       }),
//     );
//     log.i("DONE");
//     return data;
//   } catch (err) {
//     log.w(err);
//     throw new AppError("query.getByUuid failed", { cause: err });
//   }
// };

module.exports.getFileMetaData = async (uuid) => {
  log.i("IN");
  try {
    console.log("getPoolDoc()", getPoolDoc());
    const { rows, rowCount } = await getPoolDoc().query(
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

module.exports.createFile = async (
  filename,
  category,
  mimetype,
  data,
  userid,
) => {
  log.i("createFile pg - In");
  try {
    log.i("createFile pg", { category, filename, mimetype });
    const {
      rows: [{ uuid }],
    } = await getPoolDoc().query(
      ...query.create(category, filename, mimetype, userid, data),
    );
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

module.exports.getStaticFile = (name, directory) => {
  const publicDir = path.resolve(__dirname, directory);
  const filePath = path.resolve(publicDir, name);

  if (!filePath.startsWith(publicDir + path.sep)) {
    throw new AppError("Invalid file path", { cause: "Invalid file path" });
  }
  return filePath;
};

async function uploadToS3(filename, category, mimetype, userid, data, uuid) {
  log.i("uploadToS3 - In");
  try {
    log.d("uploadToS3", category, filename);
    const { name, extension } = getFileNameAndExtension(filename);

    const encodedFilename = encodeFilename(name);

    await s3Client.send(
      new PutObjectCommand({
        Body: data,
        Bucket: S3_BUCKET_NAME,
        Key: `${S3_BUCKET_ROOT_DIR}/${uuid}`,
        Metadata: {
          category,
          created_at: new Date().toISOString(),
          extension,
          mimetype: mimetype,
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
