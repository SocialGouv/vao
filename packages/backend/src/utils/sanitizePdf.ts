import * as Sentry from "@sentry/node";
import {
  PDFArray,
  PDFContext,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFObject,
  PDFRef,
} from "pdf-lib";

import { config } from "../config";
import { logger } from "./logger";

const log = logger(module.filename);

const JS_KEY = PDFName.of("JS");
const S_KEY = PDFName.of("S");
const A_KEY = PDFName.of("A");
const AA_KEY = PDFName.of("AA");
const JAVASCRIPT_VALUE = "/JavaScript";

/**
 * Retourne true si le dictionnaire est une action de type JavaScript
 * (dictionnaire d'action portant /S /JavaScript).
 *
 * NOTE (limite assumée) : un dictionnaire malformé qui ne porterait qu'un /JS
 * (ex. `<< /JS (…) >>`) sans /S /JavaScript n'est pas détecté ici. Non conforme
 * à la spec, mais certains lecteurs permissifs pourraient l'exécuter. Les
 * générateurs réels (y compris malveillants) respectent /S /JavaScript ; on
 * documente volontairement ce cas résiduel plutôt que d'élargir la détection
 * au risque de rouvrir des faux positifs (l'objectif même du ticket).
 */
function isJavaScriptAction(dict: PDFDict): boolean {
  const s = dict.get(S_KEY);
  return s instanceof PDFName && s.toString() === JAVASCRIPT_VALUE;
}

/**
 * Résout une valeur (dictionnaire, référence, ou tableau de ces derniers) en
 * une liste de dictionnaires, pour traiter uniformément les différents
 * placements d'une action PDF.
 */
function toActionDicts(
  context: PDFContext,
  value: PDFObject | undefined,
): PDFDict[] {
  if (!value) return [];

  const values =
    value instanceof PDFArray
      ? Array.from({ length: value.size() }, (_, i) => value.get(i))
      : [value];

  const dicts: PDFDict[] = [];
  for (const el of values) {
    const resolved =
      el instanceof PDFDict
        ? el
        : el instanceof PDFRef
          ? context.lookup(el)
          : undefined;
    if (resolved instanceof PDFDict) dicts.push(resolved);
  }
  return dicts;
}

/**
 * Supprime la clé `key` du dictionnaire si sa valeur est (ou référence) une
 * action de type JavaScript. Utilisé pour les actions à clé nommée, comme
 * /OpenAction au niveau du catalogue, sans toucher aux actions légitimes
 * non-JS (ex. un /OpenAction GoTo qui positionne simplement le document).
 */
function removeActionIfJavaScript(dict: PDFDict, key: PDFName): void {
  const value = dict.get(key);
  if (value && toActionDicts(dict.context, value).some(isJavaScriptAction)) {
    dict.delete(key);
  }
}

/**
 * Retire le JavaScript d'un dictionnaire :
 * - si le dictionnaire est lui-même une action JavaScript, on le neutralise
 *   (retrait des clés /JS et /S) ;
 * - on supprime l'action /A si elle est de type JavaScript (en raisonnant
 *   sur chaque élément d'un éventuel tableau, pour préserver les actions
 *   non-JS d'un mélange) ;
 * - dans /AA, on supprime chaque déclencheur dont l'action est JavaScript.
 */
function removeJavaScriptFromDict(dict: PDFDict): void {
  if (isJavaScriptAction(dict)) {
    dict.delete(JS_KEY);
    dict.delete(S_KEY);
  }

  const action = dict.get(A_KEY);
  if (action instanceof PDFArray) {
    // Tableau d'actions : on retire uniquement les éléments JavaScript, en
    // conservant les actions légitimes non-JS présentes dans le même tableau.
    for (let i = action.size() - 1; i >= 0; i -= 1) {
      const entry = action.get(i);
      const resolved =
        entry instanceof PDFDict
          ? entry
          : entry instanceof PDFRef
            ? dict.context.lookup(entry)
            : undefined;
      if (resolved instanceof PDFDict && isJavaScriptAction(resolved)) {
        action.remove(i);
      }
    }
  } else if (
    action &&
    toActionDicts(dict.context, action).some(isJavaScriptAction)
  ) {
    dict.delete(A_KEY);
  }

  // /AA peut être stocké inline (dict directement présent) ou indirectement
  // (une PDFRef à résoudre) ; on le résout pour couvrir les deux cas.
  const additionalActionsRaw = dict.get(AA_KEY);
  const additionalActions =
    additionalActionsRaw instanceof PDFDict
      ? additionalActionsRaw
      : additionalActionsRaw instanceof PDFRef
        ? dict.context.lookup(additionalActionsRaw)
        : undefined;
  if (additionalActions instanceof PDFDict) {
    for (const trigger of additionalActions.keys()) {
      if (
        toActionDicts(dict.context, additionalActions.get(trigger)).some(
          isJavaScriptAction,
        )
      ) {
        additionalActions.delete(trigger);
      }
    }
  }
}

/**
 * Supprime le JavaScript présent dans les formulaires (AcroForm) : actions
 * attachées aux champs/widgets, aux annotations de page, ainsi que tout
 * dictionnaire d'action JavaScript détaché ou inline. L'AcroForm et ses
 * champs (non-JS) sont conservés.
 */
function removeJavaScriptFromAcroForm(pdfDoc: PDFDocument): void {
  // Dictionnaires d'action détachés, embarqués dans des objets indirects, ou
  // porteurs inline d'actions JS dans leurs sous-dictionnaires /A et /AA.
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFDict) removeJavaScriptFromDict(obj);
  }

  // Annotations de chaque page (widgets hors formulaire / annotations liées).
  for (const page of pdfDoc.getPages()) {
    const annots = page.node.get(PDFName.of("Annots"));
    if (annots instanceof PDFArray) {
      for (let i = 0; i < annots.size(); i += 1) {
        const annotation = annots.get(i);
        const dict =
          annotation instanceof PDFDict
            ? annotation
            : annotation instanceof PDFRef
              ? page.node.context.lookup(annotation)
              : undefined;
        if (dict instanceof PDFDict) removeJavaScriptFromDict(dict);
      }
    }
  }

  // Champs du formulaire enregistré dans l'AcroForm racine.
  const acroForm = pdfDoc.catalog.getAcroForm();
  if (acroForm) {
    for (const [field] of acroForm.getAllFields()) {
      removeJavaScriptFromDict(field.dict);
    }
  }
}

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
    const openActionKey = PDFName.of("OpenAction");

    // Un PDF sans catalogue racine valide est inexploitable : on le rejette
    // plutôt que d'échouer plus tard sur des accès au catalogue indéfini.
    if (!catalog) {
      throw new Error(
        "sanitizePdf: catalogue racine introuvable (PDF corrompu)",
      );
    }

    // 1. Actions au niveau du catalogue racine.
    // Note : le JavaScript nommé ne vit pas dans une clé /JavaScript du
    // catalogue (spec : catalogue[/Names][/JavaScript]) ; ces scripts nommés
    // sont donc couverts par le sweep de removeJavaScriptFromAcroForm()
    // ci-dessous, qui neutralise ces dictionnaires d'action /S /JavaScript.
    // On retire /OpenAction uniquement s'il s'agit d'une action JavaScript
    // (et non, par exemple, d'un /OpenAction GoTo légitime), et les /AA.
    removeActionIfJavaScript(catalog, openActionKey);
    removeJavaScriptFromDict(catalog);

    // 2. Actions additionnelles au niveau de chaque page (chirurgical : on ne
    // supprime que les déclencheurs portant du JavaScript, pas les non-JS).
    for (const page of pdfDoc.getPages()) {
      removeJavaScriptFromDict(page.node);
    }

    // 3. Suppression du JavaScript présent dans les formulaires (AcroForm).
    // L'AcroForm et ses champs non-JS sont conservés (les justificatifs
    // peuvent légitimement contenir des champs de formulaire), mais toute
    // action JavaScript - qu'elle soit attachée aux champs/widgets, aux
    // annotations, ou qu'elle soit un dictionnaire d'action détaché ou inline
    // - est neutralisée : un fichier nettoyé ne doit plus porter de JS actif.
    removeJavaScriptFromAcroForm(pdfDoc);

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
