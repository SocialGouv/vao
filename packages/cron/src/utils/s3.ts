import {
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { encodeFilename, getFileNameAndExtension } from "@vao/shared-bridge";
import { s3 } from "../config";

let s3Client: S3Client | undefined;

export const getS3Client = (): S3Client => {
  if (s3Client) {
    return s3Client;
  }

  s3Client = new S3Client({
    credentials: {
      accessKeyId: s3.accessKeyId,
      secretAccessKey: s3.secretAccessKey,
    },
    endpoint: s3.endpoint,
    forcePathStyle: true,
    region: s3.region,
  });

  return s3Client;
};

export const objectExists = async (objectKey: string): Promise<boolean> => {
  try {
    await getS3Client().send(
      new HeadObjectCommand({
        Bucket: s3.bucketName,
        Key: objectKey,
      }),
    );
    return true;
  } catch (err) {
    const error = err as { name?: string; $metadata?: { httpStatusCode?: number } };
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw err;
  }
};

export const uploadDocumentToS3 = async (params: {
  uuid: string;
  category: string;
  filename: string;
  mimeType: string;
  userId: number | null;
  createdAt: Date | string;
  file: Buffer;
}): Promise<string> => {
  const objectKey = `${s3.rootDir}/${params.uuid}`;
  const { name, extension } = getFileNameAndExtension(params.filename);
  const encodedFilename = encodeFilename(name);

  await getS3Client().send(
    new PutObjectCommand({
      Body: params.file,
      Bucket: s3.bucketName,
      Key: objectKey,
      Metadata: {
        category: String(params.category),
        created_at: String(params.createdAt),
        extension,
        mimetype: String(params.mimeType),
        originalname: encodedFilename,
        userid: String(params.userId ?? ""),
      },
    }),
  );

  return objectKey;
};
