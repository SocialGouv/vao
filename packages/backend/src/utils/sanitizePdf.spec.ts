import { PDFArray, PDFDict, PDFDocument, PDFName } from "pdf-lib";

import {
  createCorruptPdf,
  createMinimalPdf,
  createPdfWithAcroFormJavaScript,
  createPdfWithAcroFormNoJs,
  createPdfWithJavaScript,
  createPdfWithNamedJavaScript,
  createPdfWithNextJavaScript,
  readEncryptedPdfFixture,
} from "../__tests__/helpers/fileHelper";
import { sanitizePdf } from "./sanitizePdf";

const catalogHas = (doc: PDFDocument, key: string) =>
  doc.catalog.has(PDFName.of(key));

/**
 * Retourne true si le PDF contient encore, dans l'un de ses objets indirects,
 * une action or script JavaScript (ne traite pas les simples occurrences
 * textuelles accidentelles dans des chaînes de contenu).
 */
const hasJavaScriptAction = async (pdfBuffer: Buffer): Promise<boolean> => {
  const doc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
    throwOnInvalidObject: false,
  });

  return [...doc.context.enumerateIndirectObjects()].some(([, obj]) => {
    const str = obj.toString();
    return (
      str.includes("/S /JavaScript") ||
      /\/JS\b/.test(str) ||
      str.includes("getField(") ||
      str.includes("setItems(")
    );
  });
};

describe("sanitizePdf", () => {
  it("devrait retirer une action JavaScript de /OpenAction (catalogue racine)", async () => {
    const output = await sanitizePdf(await createPdfWithJavaScript());
    const doc = await PDFDocument.load(output);

    expect(catalogHas(doc, "OpenAction")).toBe(false);
    await expect(hasJavaScriptAction(output)).resolves.toBe(false);
  });

  it("devrait retirer les déclencheurs JavaScript de /AA d'une page", async () => {
    const output = await sanitizePdf(await createPdfWithJavaScript());

    // Une fois le déclencheur /O (JS) retiré, aucune action JavaScript ne doit
    // subsister dans le document (garantie structurelle).
    await expect(hasJavaScriptAction(output)).resolves.toBe(false);
  });

  it("devrait préserver un /OpenAction non-JS (suppression chirurgicale)", async () => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    pdfDoc.catalog.set(
      PDFName.of("OpenAction"),
      pdfDoc.context.obj({ D: [page.ref, "XYZ", null, null, null], S: "GoTo" }),
    );

    const output = await sanitizePdf(Buffer.from(await pdfDoc.save()));
    const doc = await PDFDocument.load(output);

    expect(catalogHas(doc, "OpenAction")).toBe(true);
  });

  it("devrait retirer le JavaScript d'un champ de formulaire (AcroForm)", async () => {
    const output = await sanitizePdf(await createPdfWithAcroFormJavaScript());
    const doc = await PDFDocument.load(output);

    await expect(hasJavaScriptAction(output)).resolves.toBe(false);
    // L'AcroForm et ses champs sont conservés.
    const acroForm = doc.catalog.getAcroForm();
    expect(acroForm).toBeDefined();
    expect(acroForm!.getAllFields().length).toBeGreaterThan(0);
  });

  it("devrait préserver un formulaire sans JavaScript", async () => {
    const output = await sanitizePdf(await createPdfWithAcroFormNoJs());
    const doc = await PDFDocument.load(output);

    const acroForm = doc.catalog.getAcroForm();
    expect(acroForm).toBeDefined();
    expect(acroForm!.getAllFields().length).toBeGreaterThan(0);
    await expect(hasJavaScriptAction(output)).resolves.toBe(false);
  });

  it("devrait préserver un PDF sain (nombre de pages, absence d'effet de bord)", async () => {
    const output = await sanitizePdf(await createMinimalPdf());
    const doc = await PDFDocument.load(output);

    expect(doc.getPageCount()).toBe(1);
    await expect(hasJavaScriptAction(output)).resolves.toBe(false);
  });

  it("devrait rejeter un PDF corrompu/illisible", async () => {
    await expect(sanitizePdf(createCorruptPdf())).rejects.toThrow();
  });

  it("devrait rejeter un PDF chiffré (au lieu de stocker un fichier corrompu)", async () => {
    await expect(sanitizePdf(readEncryptedPdfFixture())).rejects.toThrow();
  });

  it("devrait neutraliser les scripts JavaScript nommés catalogue[/Names][/JavaScript] (valeurs inline)", async () => {
    const output = await sanitizePdf(await createPdfWithNamedJavaScript());
    const doc = await PDFDocument.load(output);

    // Plus aucun /S /JavaScript sur les valeurs de l'arbre de noms.
    expect(nameTreeContainsJavaScript(doc)).toBe(false);
    // L'action /OpenAction /Named (non-JS) est conservée.
    expect(catalogHas(doc, "OpenAction")).toBe(true);
  });

  it("devrait retirer une action /Next JavaScript en préservant le /OpenAction GoTo", async () => {
    const output = await sanitizePdf(await createPdfWithNextJavaScript());
    const doc = await PDFDocument.load(output);

    const openActionValue = doc.catalog.get(PDFName.of("OpenAction"));
    expect(openActionValue).toBeInstanceOf(PDFDict);
    const openAction = openActionValue as PDFDict;
    expect(openAction.get(PDFName.of("S"))?.toString()).toBe("/GoTo");
    expect(openAction.get(PDFName.of("Next"))).toBeUndefined();
  });
});

/**
 * Parcourt l'arbre de noms catalogue[/Names][/JavaScript] et retourne true si
 * l'un de ses dictionnaires de valeur est (encore) une action /S /JavaScript.
 */
function nameTreeContainsJavaScript(doc: PDFDocument): boolean {
  const walk = (node: PDFDict): boolean => {
    const kids = node.get(PDFName.of("Kids"));
    if (kids instanceof PDFArray) {
      for (let i = 0; i < kids.size(); i += 1) {
        const child = kids.get(i);
        if (child instanceof PDFDict && walk(child)) return true;
      }
    }
    const namesEntry = node.get(PDFName.of("Names"));
    if (namesEntry instanceof PDFArray) {
      for (let i = 1; i < namesEntry.size(); i += 2) {
        const value = namesEntry.get(i);
        if (
          value instanceof PDFDict &&
          value.get(PDFName.of("S"))?.toString() === "/JavaScript"
        ) {
          return true;
        }
      }
    }
    return false;
  };

  const names = doc.catalog.get(PDFName.of("Names"));
  if (!(names instanceof PDFDict)) return false;
  const jsTree = names.get(PDFName.of("JavaScript"));
  return jsTree instanceof PDFDict && walk(jsTree);
}
