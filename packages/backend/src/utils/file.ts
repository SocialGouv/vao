import { Readable } from "node:stream";
// To remove when sentry support node 23 > https://github.com/getsentry/sentry-javascript/issues/14475

export function encodeFilename(fileName: string): string {
  return Buffer.from(fileName, "latin1").toString("base64");
}

export function decodeFilename(encodedFileName: string): string {
  return Buffer.from(encodedFileName, "base64").toString("latin1");
}

export function getFileNameAndExtension(fileName: string): {
  extension: string;
  name: string;
} {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return { extension: "", name: fileName };
  }

  const name = fileName.slice(0, dotIndex);
  const extension = fileName.slice(dotIndex);

  return { extension, name };
}

export async function getFileTypeFromBuffer(
  buffer: Buffer,
): Promise<{ ext: string; mime: string } | undefined> {
  const fileTypeLib = await import("file-type");
  return fileTypeLib.fileTypeFromBuffer(buffer);
}

export async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as ArrayBuffer),
    );
  }
  return Buffer.concat(chunks);
}
