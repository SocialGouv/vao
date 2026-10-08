import * as Sentry from "@sentry/node";
import {
  PDFArray,
  PDFContext,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFObject,
  PDFPage,
  PDFRef,
} from "pdf-lib";

import { config } from "../config";
import { logger } from "./logger";

const log = logger(module.filename);

const JS_KEY = PDFName.of("JS");
const S_KEY = PDFName.of("S");
const A_KEY = PDFName.of("A");
const AA_KEY = PDFName.of("AA");
const NEXT_KEY = PDFName.of("Next");
const NAMES_KEY = PDFName.of("Names");
const JAVASCRIPT_KEY = PDFName.of("JavaScript");
const KIDS_KEY = PDFName.of("Kids");
const JAVASCRIPT_VALUE = "/JavaScript";

// Drapeau indiquant qu'une mutation a été réalisée pendant le nettoyage. Reseté
// à chaque appel de sanitizePdf.
let modified = false;
const markModified = (): void => {
  modified = true;
};

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
    markModified();
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
 * - il en va de même pour la suite d'actions /Next, dont on parcourt
 *   récursivement les actions non-JS (chaînes /Next possiblement inline) ;
 * - dans /AA, on supprime chaque déclencheur dont l'action est JavaScript.
 */
function removeJavaScriptFromDict(dict: PDFDict): void {
  removeJavaScriptFromDictRec(dict, new Set());
}

function removeJavaScriptFromDictRec(
  dict: PDFDict,
  visited: Set<PDFDict>,
): void {
  // Garde anti-cycle : les suites d'actions /Next peuvent être cycliques.
  if (visited.has(dict)) return;
  visited.add(dict);

  if (isJavaScriptAction(dict)) {
    markModified();
    dict.delete(JS_KEY);
    dict.delete(S_KEY);
  }

  removeJavaScriptActionKey(dict, A_KEY, visited);
  removeJavaScriptActionKey(dict, NEXT_KEY, visited);

  const additionalActions = resolveDictionary(dict.get(AA_KEY), dict.context);
  if (additionalActions instanceof PDFDict) {
    removeJavaScriptTriggers(dict, additionalActions);
  }
}

/**
 * Repousse l'action d'une clé donnée (typiquement /A ou /Next) lorsqu'elle est
 * (ou référence) une action JavaScript, qu'elle soit un dictionnaire unique ou
 * un tableau d'actions (les actions légitimes non-JS d'un mélange sont
 * conservées). Les actions non-JS restantes sont elles-mêmes parcourues, afin
 * de neutraliser un JavaScript éventuellement enchaîné via /Next (inline).
 */
function removeJavaScriptActionKey(
  dict: PDFDict,
  key: PDFName,
  visited: Set<PDFDict>,
): void {
  const action = dict.get(key);
  if (action instanceof PDFArray) {
    removeJavaScriptFromArray(dict, action, visited);
  } else if (action) {
    const actionDicts = toActionDicts(dict.context, action);
    if (actionDicts.some(isJavaScriptAction)) {
      markModified();
      dict.delete(key);
    } else {
      for (const subAction of actionDicts) {
        removeJavaScriptFromDictRec(subAction, visited);
      }
    }
  }
}

/**
 * Résout une valeur PDF (implicitement un dictionnaire, voire une référence)
 * vers le dictionnaire qu'elle désigne. Retourne undefined si la valeur n'est
 * pas (ou ne référence pas) un dictionnaire.
 */
function resolveDictionary(
  value: PDFObject | undefined,
  context: PDFContext,
): PDFDict | undefined {
  if (value instanceof PDFDict) return value;
  if (value instanceof PDFRef) {
    const resolved = context.lookup(value);
    return resolved instanceof PDFDict ? resolved : undefined;
  }
  return undefined;
}

/**
 * Retire les actions JavaScript d'un tableau d'actions, en conservant les
 * actions légitimes non-JS présentes dans le même tableau (elles-mêmes
 * parcourues pour les chaînes /Next éventuelles).
 */
function removeJavaScriptFromArray(
  dict: PDFDict,
  array: PDFArray,
  visited: Set<PDFDict>,
): void {
  for (let i = array.size() - 1; i >= 0; i -= 1) {
    const resolved = resolveDictionary(array.get(i), dict.context);
    if (resolved instanceof PDFDict && isJavaScriptAction(resolved)) {
      markModified();
      array.remove(i);
    } else if (resolved instanceof PDFDict) {
      removeJavaScriptFromDictRec(resolved, visited);
    }
  }
}

/**
 * Supprime chaque déclencheur d'actions additionnelles (/AA) dont l'action est
 * une action JavaScript.
 */
function removeJavaScriptTriggers(dict: PDFDict, triggers: PDFDict): void {
  for (const trigger of triggers.keys()) {
    if (
      toActionDicts(dict.context, triggers.get(trigger)).some(
        isJavaScriptAction,
      )
    ) {
      markModified();
      triggers.delete(trigger);
    }
  }
}

/**
 * Supprime le JavaScript présent dans les formulaires (AcroForm) : actions
 * attachées aux champs/widgets, aux annotations de page, ainsi que tout
 * dictionnaire d'action JavaScript détaché ou inline implanté dans un objet
 * indirect. L'AcroForm et ses champs (non-JS) sont conservés.
 * (Les scripts nommés catalogue[/Names][/JavaScript] sont traités à part, et
 * le JavaScript dans les flux XFA est un vecteur résiduel assumé, cf. doc.)
 */
function removeJavaScriptFromAcroForm(pdfDoc: PDFDocument): void {
  // Dictionnaires d'action détachés, embarqués dans des objets indirects, ou
  // porteurs inline d'actions JS dans leurs sous-dictionnaires /A et /AA.
  for (const [, obj] of pdfDoc.context.enumerateIndirectObjects()) {
    if (obj instanceof PDFDict) removeJavaScriptFromDict(obj);
  }

  // Annotations de chaque page (widgets hors formulaire / annotations liées).
  for (const page of pdfDoc.getPages()) {
    removeJavaScriptFromPage(page);
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
 * Épingle les annotations d'une page (widgets hors formulaire ou annotations
 * liées) qui portent un déclencheur JavaScript.
 */
function removeJavaScriptFromPage(page: PDFPage): void {
  const annots = page.node.get(PDFName.of("Annots"));
  if (!(annots instanceof PDFArray)) return;
  for (let i = 0; i < annots.size(); i += 1) {
    const dict = resolveDictionary(annots.get(i), page.node.context);
    if (dict instanceof PDFDict) removeJavaScriptFromDict(dict);
  }
}

/**
 * Parcourt l'arbre de noms catalogue[/Names][/JavaScript] et neutralise chaque
 * dictionnaire d'action JavaScript qui y est enregistré (script nommé,
 * invocable via une action /Named). La structure de l'arbre est préservée
 * (on ne supprime pas les entrées) : on neutralise simplement le dictionnaire
 * ciblé, de sorte qu'il ne soit plus /S /JavaScript et donc plus exécutable.
 *
 * Couvre aussi bien les valeurs indirectes que les valeurs directes (inline),
 * ces dernières échappant naturellement au sweep des objets indirects.
 */
function removeJavaScriptFromNameTree(pdfDoc: PDFDocument): void {
  const names = pdfDoc.catalog.get(NAMES_KEY);
  if (!(names instanceof PDFDict)) return;
  const jsTree = resolveDictionary(names.get(JAVASCRIPT_KEY), pdfDoc.context);
  if (jsTree instanceof PDFDict) {
    neutralizeJavaScriptNameTreeNode(pdfDoc.context, jsTree);
  }
}

/**
 * Parcourt récursivement un nœud d'arbre de noms (intermédiaires via /Kids,
 * feuilles via /Names) et neutralise les actions JavaScript trouvées dans les
 * valeurs de l'array /Names (indices impairs).
 */
function neutralizeJavaScriptNameTreeNode(
  context: PDFContext,
  node: PDFDict,
): void {
  const kids = node.get(KIDS_KEY);
  if (kids instanceof PDFArray) {
    for (let i = 0; i < kids.size(); i += 1) {
      const child = resolveDictionary(kids.get(i), context);
      if (child instanceof PDFDict) {
        neutralizeJavaScriptNameTreeNode(context, child);
      }
    }
  }

  const names = node.get(NAMES_KEY);
  if (!(names instanceof PDFArray)) return;
  for (let i = 1; i < names.size(); i += 2) {
    const dict = resolveDictionary(names.get(i), context);
    if (dict instanceof PDFDict && isJavaScriptAction(dict)) {
      markModified();
      dict.delete(S_KEY);
      dict.delete(JS_KEY);
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
 * stockage : le fichier est toujours accepté, mais sans JavaScript actif dans
 * les structures couvertes (objets indirects, /A, /Next, /AA, annotations de
 * page, champs AcroForm et script nommés catalogue[/Names][/JavaScript]).
 *
 * Si aucune action JavaScript n'est trouvée, le buffer d'entrée est renvoyé
 * tel quel (byte-identical), sans resérialisation : on évite ainsi de réécrire
 * inutilement un PDF sain (le save() de pdf-lib peut altérer la structure
 * binaire - xref, compression, ordre des objets - d'un fichier inchangé).
 * La resérialisation n'a lieu que si une modification réelle a été apportée.
 *
 * Limites assumées : le JavaScript hébergé dans les flux XFA (formulaires XML
 * Acrobat, `<script>`) n'est pas analysé ici — vecteur résiduel, principalement
 * couvert par la couche de scan antivirus (ClamAV) ; son exécution requiert de
 * toute façon Acrobat, les navigateurs et lecteurs standards l'ignorant.
 *
 * Les PDF chiffrés sont refusés (déclenchent une erreur → 415) : pdf-lib ne
 * les déchiffre pas, et leur ré-sérialisation produirait un fichier stocké
 * corrompu/illisible — une acceptation silencieuse contraire à l'objectif du
 * ticket.
 */
export async function sanitizePdf(fileBuffer: Buffer): Promise<Buffer> {
  log.i("sanitizePdf - IN");
  modified = false;
  try {
    const pdfDoc = await PDFDocument.load(fileBuffer, {
      // Certains PDF générés automatiquement ont une structure légèrement
      // non conforme ; on tolère ces cas plutôt que de les rejeter d'office.
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

    // PDF chiffré : on le refuse plutôt que de stocker un fichier corrompu.
    // Le parse tolérant ci-dessus conserve le flag ; le rejet est explicite.
    if (pdfDoc.isEncrypted) {
      throw new Error("sanitizePdf: PDF chiffré, refuse de le ré-sérialiser");
    }

    const catalog = pdfDoc.catalog;
    const openActionKey = PDFName.of("OpenAction");

    // Un PDF sans catalogue racine valide est inexploitable : on le rejette
    // plutôt que d'échouer plus tard sur des accès au catalogue indéfini.
    if (!catalog) {
      throw new Error(
        "sanitizePdf: catalogue racine introuvable (PDF corrompu)",
      );
    }

    // 1. Actions au niveau du catalogue racine. Le JavaScript nommé vit dans
    // catalogue[/Names][/JavaScript] (et non dans une clé /JavaScript directe
    // du catalogue) ; il est traité à l'étape 4 via un parcours dédié de
    // l'arbre de noms (valeurs indirectes ET directes). On retire /OpenAction
    // uniquement s'il s'agit d'une action JavaScript (et non, par exemple,
    // d'un /OpenAction GoTo légitime), et les /AA.
    removeActionIfJavaScript(catalog, openActionKey);
    removeJavaScriptFromDict(catalog);
    // /OpenAction non-JS (ex. GoTo légitime) : on le parcourt aussi, afin de
    // neutraliser une action JavaScript éventuellement enchaînée via /Next.
    const openAction = resolveDictionary(
      catalog.get(openActionKey),
      catalog.context,
    );
    if (openAction instanceof PDFDict) {
      removeJavaScriptFromDict(openAction);
    }

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
    // - est neutralisée.
    removeJavaScriptFromAcroForm(pdfDoc);

    // 4. Scripts nommés : catalogue[/Names][/JavaScript]. On neutralise les
    // dictionnaires d'action /S /JavaScript enregistrés dans l'arbre de noms,
    // y compris les valeurs directes inline qui échappent au sweep.
    removeJavaScriptFromNameTree(pdfDoc);

    if (!modified) {
      log.i("sanitizePdf - OK (aucune modification, fichier inchangé)");
      return fileBuffer;
    }

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
