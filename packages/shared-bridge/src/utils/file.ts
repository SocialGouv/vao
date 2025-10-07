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

export const getFileUploadErrorMessage = (
  fileName?: string,
  codeError?: string,
) => {
  let description = "Une erreur est survenue lors du dépôt du document";
  if (!fileName) {
    return description;
  }
  if (!codeError) {
    return `${description} ${fileName}`;
  }
  switch (codeError) {
    case "FileIsTooLargeError":
      description = `Le fichier ${fileName} dépasse la taille maximale autorisée (5Mo)`;
      break;
    case "FileTypeError":
      description = `Le type de fichier ${fileName} n'est pas reconnu. Veuillez télécharger un fichier PDF, PNG, JPG ou JPEG.`;
      break;
    case "FileTypePdfOnlyError":
      description = `Le type de fichier ${fileName} n'est pas supporté. Veuillez télécharger un fichier PDF.`;
      break;
    case "FileExtensionError":
      description = `Le type de fichier ${fileName} n'est pas supporté. Veuillez télécharger un fichier PDF, PNG, JPG ou JPEG.`;
      break;
    case "FileContainsJavaScriptError":
      description = `Le fichier ${fileName} a été rejeté car il semble contenir du code JavaScript.`;
      break;
    default:
      description = `${description} ${fileName}`;
      break;
  }
  return description;
};
