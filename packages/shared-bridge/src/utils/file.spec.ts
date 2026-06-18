/* eslint-disable import/no-unresolved */
import { FILE_CATEGORY, FILE_CATEGORY_CONFIG } from "../constantes";
import { AgrementFilesDto } from "../dto";
import {
  decodeFilename,
  encodeFilename,
  getFileByCategory,
  getFileCategoryLabel,
  getFileNameAndExtension,
  getFilesByCategory,
  getFileUploadErrorMessage,
} from "./file";

const createFile = (
  overrides: Partial<AgrementFilesDto> = {},
): AgrementFilesDto => ({
  agrementId: 1,
  category: FILE_CATEGORY.PROCVERBAL,
  fileUuid: "uuid-1",
  ...overrides,
});

describe("file utils", () => {
  describe("encodeFilename", () => {
    it("should encode a simple filename", () => {
      const fileName = "test.pdf";
      const encoded = encodeFilename(fileName);
      expect(encoded).toBe(Buffer.from(fileName, "latin1").toString("base64"));
    });

    it("should encode a filename with special characters", () => {
      const fileName = "test-éàç.pdf";
      const encoded = encodeFilename(fileName);
      expect(encoded).toBe(Buffer.from(fileName, "latin1").toString("base64"));
    });

    it("should encode an empty string", () => {
      const fileName = "";
      const encoded = encodeFilename(fileName);
      expect(encoded).toBe(Buffer.from(fileName, "latin1").toString("base64"));
    });

    it("should encode a filename with spaces", () => {
      const fileName = "test file name.pdf";
      const encoded = encodeFilename(fileName);
      expect(encoded).toBe(Buffer.from(fileName, "latin1").toString("base64"));
    });
  });

  describe("decodeFilename", () => {
    it("should decode a simple filename", () => {
      const fileName = "test.pdf";
      const encoded = Buffer.from(fileName, "latin1").toString("base64");
      const decoded = decodeFilename(encoded);
      expect(decoded).toBe(fileName);
    });

    it("should decode a filename with special characters", () => {
      const fileName = "test-éàç.pdf";
      const encoded = Buffer.from(fileName, "latin1").toString("base64");
      const decoded = decodeFilename(encoded);
      expect(decoded).toBe(fileName);
    });

    it("should decode an empty string", () => {
      const fileName = "";
      const encoded = Buffer.from(fileName, "latin1").toString("base64");
      const decoded = decodeFilename(encoded);
      expect(decoded).toBe(fileName);
    });

    it("should decode a filename with spaces", () => {
      const fileName = "test file name.pdf";
      const encoded = Buffer.from(fileName, "latin1").toString("base64");
      const decoded = decodeFilename(encoded);
      expect(decoded).toBe(fileName);
    });

    it("should be the inverse of encodeFilename", () => {
      const originalFileName = "test-éàç file.pdf";
      const encoded = encodeFilename(originalFileName);
      const decoded = decodeFilename(encoded);
      expect(decoded).toBe(originalFileName);
    });
  });

  describe("getFileNameAndExtension", () => {
    it("should split filename with extension", () => {
      const fileName = "document.pdf";
      const result = getFileNameAndExtension(fileName);
      expect(result).toEqual({
        extension: ".pdf",
        name: "document",
      });
    });

    it("should split filename with multiple dots", () => {
      const fileName = "my.document.backup.pdf";
      const result = getFileNameAndExtension(fileName);
      expect(result).toEqual({
        extension: ".pdf",
        name: "my.document.backup",
      });
    });

    it("should handle filename without extension", () => {
      const fileName = "document";
      const result = getFileNameAndExtension(fileName);
      expect(result).toEqual({
        extension: "",
        name: "document",
      });
    });

    it("should handle filename starting with dot", () => {
      const fileName = ".hidden";
      const result = getFileNameAndExtension(fileName);
      expect(result).toEqual({
        extension: ".hidden",
        name: "",
      });
    });

    it("should handle empty string", () => {
      const fileName = "";
      const result = getFileNameAndExtension(fileName);
      expect(result).toEqual({
        extension: "",
        name: "",
      });
    });

    it("should handle filename with only extension", () => {
      const fileName = ".pdf";
      const result = getFileNameAndExtension(fileName);
      expect(result).toEqual({
        extension: ".pdf",
        name: "",
      });
    });

    it("should handle filename with special characters", () => {
      const fileName = "test-éàç.pdf";
      const result = getFileNameAndExtension(fileName);
      expect(result).toEqual({
        extension: ".pdf",
        name: "test-éàç",
      });
    });
  });

  describe("getFileUploadErrorMessage", () => {
    it("should return default message when fileName is not provided", () => {
      const result = getFileUploadErrorMessage(
        undefined,
        "FileIsTooLargeError",
      );
      expect(result).toBe("Une erreur est survenue lors du dépôt du document");
    });

    it("should return default message when fileName is undefined", () => {
      const result = getFileUploadErrorMessage(
        undefined,
        "FileIsTooLargeError",
      );
      expect(result).toBe("Une erreur est survenue lors du dépôt du document");
    });

    it("should return default message when fileName is empty", () => {
      const result = getFileUploadErrorMessage("", "FileIsTooLargeError");
      expect(result).toBe("Une erreur est survenue lors du dépôt du document");
    });

    it("should return message with fileName when codeError is undefined", () => {
      const fileName = "test.pdf";
      const result = getFileUploadErrorMessage(fileName);
      expect(result).toBe(
        "Une erreur est survenue lors du dépôt du document test.pdf",
      );
    });

    it("should return message with fileName when codeError is empty", () => {
      const fileName = "test.pdf";
      const result = getFileUploadErrorMessage(fileName, "");
      expect(result).toBe(
        "Une erreur est survenue lors du dépôt du document test.pdf",
      );
    });

    it("should handle FileIsTooLargeError", () => {
      const fileName = "large-file.pdf";
      const result = getFileUploadErrorMessage(fileName, "FileIsTooLargeError");
      expect(result).toBe(
        "Le fichier large-file.pdf dépasse la taille maximale autorisée (5Mo)",
      );
    });

    it("should handle FileTypeError", () => {
      const fileName = "document.txt";
      const result = getFileUploadErrorMessage(fileName, "FileTypeError");
      expect(result).toBe(
        "Le type de fichier document.txt n'est pas reconnu. Veuillez télécharger un fichier PDF, PNG, JPG ou JPEG.",
      );
    });

    it("should handle FileTypePdfOnlyError", () => {
      const fileName = "image.png";
      const result = getFileUploadErrorMessage(
        fileName,
        "FileTypePdfOnlyError",
      );
      expect(result).toBe(
        "Le type de fichier image.png n'est pas supporté. Veuillez télécharger un fichier PDF.",
      );
    });

    it("should handle FileExtensionError", () => {
      const fileName = "document.doc";
      const result = getFileUploadErrorMessage(fileName, "FileExtensionError");
      expect(result).toBe(
        "Le type de fichier document.doc n'est pas supporté. Veuillez télécharger un fichier PDF, PNG, JPG ou JPEG.",
      );
    });

    it("should handle FileContainsJavaScriptError", () => {
      const fileName = "malicious.pdf";
      const result = getFileUploadErrorMessage(
        fileName,
        "FileContainsJavaScriptError",
      );
      expect(result).toBe(
        "Le fichier malicious.pdf a été rejeté car il semble contenir du code JavaScript.",
      );
    });

    it("should handle unknown error code", () => {
      const fileName = "test.pdf";
      const result = getFileUploadErrorMessage(fileName, "UnknownError");
      expect(result).toBe(
        "Une erreur est survenue lors du dépôt du document test.pdf",
      );
    });

    it("should handle filename with special characters in error messages", () => {
      const fileName = "test-éàç.pdf";
      const result = getFileUploadErrorMessage(fileName, "FileIsTooLargeError");
      expect(result).toBe(
        "Le fichier test-éàç.pdf dépasse la taille maximale autorisée (5Mo)",
      );
    });

    it("should handle filename with spaces in error messages", () => {
      const fileName = "my document.pdf";
      const result = getFileUploadErrorMessage(fileName, "FileTypeError");
      expect(result).toBe(
        "Le type de fichier my document.pdf n'est pas reconnu. Veuillez télécharger un fichier PDF, PNG, JPG ou JPEG.",
      );
    });
  });

  describe("getFileCategoryLabel", () => {
    it("should return the configured label when the category exists in config", () => {
      const result = getFileCategoryLabel(FILE_CATEGORY.BILANQUALITPERCEPTION);
      expect(result).toBe(
        FILE_CATEGORY_CONFIG[FILE_CATEGORY.BILANQUALITPERCEPTION].label,
      );
    });

    it("should fallback to category value when the category is not in config", () => {
      const category = "CATEGORY_NOT_IN_CONFIG" as FILE_CATEGORY;
      const result = getFileCategoryLabel(category);
      expect(result).toBe(category);
    });
  });
});
describe("getFileByCategory", () => {
  it("should return the file matching the category", () => {
    const files = [
      createFile({ category: FILE_CATEGORY.PROCVERBAL }),
      createFile({ category: FILE_CATEGORY.BILANQUALITPERCEPTION }),
    ];

    const result = getFileByCategory({
      category: FILE_CATEGORY.PROCVERBAL,
      files,
    });

    expect(result).toEqual(files[0]);
  });

  it("should return null when no file matches", () => {
    const files = [
      createFile({ category: FILE_CATEGORY.BILANQUALITPERCEPTION }),
    ];

    const result = getFileByCategory({
      category: FILE_CATEGORY.PROCVERBAL,
      files,
    });

    expect(result).toBeNull();
  });

  it("should return null when files is undefined", () => {
    const result = getFileByCategory({
      category: FILE_CATEGORY.PROCVERBAL,
      files: undefined,
    });

    expect(result).toBeNull();
  });

  it("should return the first match when multiple exist", () => {
    const files = [
      createFile({ category: FILE_CATEGORY.PROCVERBAL, fileUuid: "1" }),
      createFile({ category: FILE_CATEGORY.PROCVERBAL, fileUuid: "2" }),
    ];

    const result = getFileByCategory({
      category: FILE_CATEGORY.PROCVERBAL,
      files,
    });

    expect(result).toEqual(files[0]);
  });
});

describe("getFilesByCategory", () => {
  it("should return all matching files", () => {
    const files = [
      createFile({ category: FILE_CATEGORY.PROCVERBAL, fileUuid: "1" }),
      createFile({ category: FILE_CATEGORY.PROCVERBAL, fileUuid: "2" }),
      createFile({ category: FILE_CATEGORY.BILANQUALITPERCEPTION }),
    ];

    const result = getFilesByCategory({
      category: FILE_CATEGORY.PROCVERBAL,
      files,
    });

    expect(result).toEqual([files[0], files[1]]);
  });

  it("should return empty array when no match", () => {
    const files = [
      createFile({ category: FILE_CATEGORY.BILANQUALITPERCEPTION }),
    ];

    const result = getFilesByCategory({
      category: FILE_CATEGORY.PROCVERBAL,
      files,
    });

    expect(result).toEqual([]);
  });

  it("should return empty array when files is null", () => {
    const result = getFilesByCategory({
      category: FILE_CATEGORY.PROCVERBAL,
      files: null,
    });

    expect(result).toEqual([]);
  });
});
