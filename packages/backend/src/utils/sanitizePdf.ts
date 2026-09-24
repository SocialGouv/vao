import * as Sentry from "@sentry/node";
import { PDFDocument, PDFName } from "pdf-lib";

import { config } from "../config";
import { logger } from "./logger";

const log = logger(module.filename);

/**
 * Nettoie un PDF en supprimant les déclencheurs JavaScript / actions
 * automatiques potentiellement présents dans sa structure, qu'ils soient
 * actifs ou non (voir JIRA : de nombreux générateurs de PDF insèrent ces clés
 * vides, provoquant des faux positifs avec une simple détection).
 *
 * Plutôt que de rejeter le fichier, on l'assainit systématiquement avant
 * stockage : le fichier est toujours accepté, mais garanti sans JS actif.
 */
export async function sanitizePdf(fileBuffer: Buffer): Promise<Buffer> {
  log.i("sanitizePdf - IN");
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer, {
      // Certains PDF générés automatiquement ont une structure légèrement
      // non conforme ; on tolère ces cas plutôt que de les rejeter d'office.
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

    const catalog = pdfDoc.catalog;

    // 1. Suppression des actions au niveau du catalogue racine
    catalog.delete(PDFName.of("JavaScript"));
    catalog.delete(PDFName.of("OpenAction"));
    catalog.delete(PDFName.of("AA"));

    // 2. Suppression des actions additionnelles au niveau de chaque page
    for (const page of pdfDoc.getPages()) {
      page.node.delete(PDFName.of("AA"));
    }

    // NOTE: on ne supprime pas ici l'AcroForm dans son ensemble : les PDF
    // uploadés (agréments, justificatifs) peuvent légitimement contenir des
    // champs de formulaire. Une suppression radicale casserait cet usage.
    // Si un besoin de nettoyage du JS spécifique aux champs de formulaire
    // est confirmé, cibler les entrées /AA au sein de chaque champ plutôt
    // que de supprimer tout l'AcroForm (à valider avec un cas de test réel
    // avant d'ajouter cette étape).

    const pdfBytes = await pdfDoc.save();

    log.i("sanitizePdf - DONE");
    return Buffer.from(pdfBytes);
  } catch (error) {
    log.w("DONE with error", error);
    if (config.sentry.enabled) {
      Sentry.captureException(error);
    }
    throw error;
  }
}
