const extensions = ["pdf", "jpg", "jpeg", "png"];
const mimetypes = ["application/pdf", "image/png", "image/jpeg"];

const fileValidation = (element: string[], filename: string): boolean =>
  element.some((extension) => filename.toLowerCase().endsWith(extension));

export const fileValidationExtension = (filename: string): boolean =>
  fileValidation(extensions, filename);

export const fileValidationMimetype = (mimetype: string): boolean =>
  mimetypes.includes(mimetype);

export const encodeFilename = (fileName: string) =>
  Buffer.from(fileName, "latin1").toString("base64");

export const decodeFilename = (encodedFileName: string) =>
  Buffer.from(encodedFileName, "base64").toString("latin1");

export const getFileNameAndExtension = (fileName: string) => {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return { extension: "", name: fileName };
  }

  const name = fileName.slice(0, dotIndex);
  const extension = fileName.slice(dotIndex);

  return { extension, name };
};
