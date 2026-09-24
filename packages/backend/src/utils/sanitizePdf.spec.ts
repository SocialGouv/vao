import { PDFDocument, PDFName } from "pdf-lib";

import {
  createCorruptPdf,
  createMinimalPdf,
  createPdfWithJavaScript,
} from "../__tests__/helpers/fileHelper";
import { sanitizePdf } from "./sanitizePdf";

const catalogHas = (doc: PDFDocument, key: string) =>
  doc.catalog.has(PDFName.of(key));

const pageHas = (doc: PDFDocument, pageIndex: number, key: string) =>
  doc.getPages()[pageIndex].node.has(PDFName.of(key));

describe("sanitizePdf", () => {
  it("devrait supprimer /OpenAction du catalogue racine", async () => {
    const output = await sanitizePdf(await createPdfWithJavaScript());
    const doc = await PDFDocument.load(output);

    expect(catalogHas(doc, "OpenAction")).toBe(false);
  });

  it("devrait supprimer /JavaScript du catalogue racine", async () => {
    const output = await sanitizePdf(await createPdfWithJavaScript());
    const doc = await PDFDocument.load(output);

    expect(catalogHas(doc, "JavaScript")).toBe(false);
  });

  it("devrait supprimer /AA des pages", async () => {
    const output = await sanitizePdf(await createPdfWithJavaScript());
    const doc = await PDFDocument.load(output);

    expect(pageHas(doc, 0, "AA")).toBe(false);
  });

  it("devrait préserver un PDF sain (nombre de pages, absence d'effet de bord)", async () => {
    const output = await sanitizePdf(await createMinimalPdf());
    const doc = await PDFDocument.load(output);

    expect(doc.getPageCount()).toBe(1);
    expect(catalogHas(doc, "OpenAction")).toBe(false);
    expect(catalogHas(doc, "JavaScript")).toBe(false);
    expect(pageHas(doc, 0, "AA")).toBe(false);
  });

  it("devrait rejeter un PDF corrompu/illisible", async () => {
    await expect(sanitizePdf(createCorruptPdf())).rejects.toThrow();
  });
});
