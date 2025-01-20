const {
  S3Client,
  DeleteObjectCommand,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

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

async function deleteAllFiles(bucketName) {
  try {
    console.log(`Fetching objects from bucket: ${bucketName}`);
    const listCommand = new ListObjectsV2Command({ Bucket: bucketName });
    const { Contents } = await s3Client.send(listCommand);

    if (!Contents || Contents.length === 0) {
      console.log("Bucket is already empty.");
      return;
    }

    for (const file of Contents) {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: file.Key,
      });
      await s3Client.send(deleteCommand);
      console.log(`Deleted: ${file.Key}`);
    }

    console.log("All files have been deleted successfully.");
  } catch (err) {
    console.error("Error deleting files:", err);
  }
}

async function main() {
  if (!S3_BUCKET_NAME) {
    console.error("S3_BUCKET_NAME is not defined in environment variables.");
    return;
  }

  await deleteAllFiles(S3_BUCKET_NAME);
}

main();
