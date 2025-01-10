// To remove when sentry support node 23 > https://github.com/getsentry/sentry-javascript/issues/14475

module.exports.encodeFilename = (fileName) =>
  Buffer.from(fileName, "latin1").toString("base64");

module.exports.decodeFilename = (encodedFileName) =>
  Buffer.from(encodedFileName, "base64").toString("latin1");

module.exports.getFileNameAndExtension = (fileName) => {
  const dotIndex = fileName.lastIndexOf(".");

  if (dotIndex === -1) {
    // Pas d'extension trouvée
    return { extension: "", fileName };
  }

  const name = fileName.slice(0, dotIndex);
  const extension = fileName.slice(dotIndex);

  return { extension, name };
};
