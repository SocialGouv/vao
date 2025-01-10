export const encodeFilename = (fileName) =>
  Buffer.from(fileName, "latin1").toString("base64");

export const decodeFilename = (encodedFileName) =>
  Buffer.from(encodedFileName, "base64").toString("latin1");

export const getFileNameAndExtension = (fileName) => {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    return { extension: "", fileName };
  }

  const name = fileName.slice(0, dotIndex);
  const extension = fileName.slice(dotIndex);

  return { name, extension };
};
