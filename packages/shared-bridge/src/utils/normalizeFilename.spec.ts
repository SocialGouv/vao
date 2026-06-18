import { normalizeFilename } from "./normalizeFilename";

function simulateMulterCorruption(utf8string: string): string {
  const bytes = new TextEncoder().encode(utf8string);
  return Array.from(bytes, (b) => String.fromCharCode(b)).join("");
}

describe("normalizeFilename", () => {
  it("should return a plain filename unchanged", () => {
    expect(normalizeFilename("document.pdf")).toEqual("document.pdf");
  });

  it("should remove accents from a corrupted multer filename", () => {
    const corrupted = simulateMulterCorruption("déclaration-été.pdf");
    expect(normalizeFilename(corrupted)).toEqual("declaration-ete.pdf");
  });

  it("should replace spaces with hyphens", () => {
    expect(normalizeFilename("mon document final.pdf")).toEqual(
      "mon-document-final.pdf",
    );
  });

  it("should collapse consecutive hyphens", () => {
    expect(normalizeFilename("fichier  avec   espaces.pdf")).toEqual(
      "fichier-avec-espaces.pdf",
    );
  });

  it("should preserve the file extension", () => {
    expect(normalizeFilename("rapport.final.pdf")).toEqual("rapport.final.pdf");
  });

  it("should handle a filename with no extension", () => {
    const corrupted = simulateMulterCorruption("réunion");
    expect(normalizeFilename(corrupted)).toEqual("reunion");
  });

  it("should handle an empty string", () => {
    expect(normalizeFilename("")).toEqual("");
  });
});
