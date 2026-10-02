import type { SiteSimilariteType } from "@vao/shared-bridge";
import { normalize, parseAddressLabel } from "@vao/shared-bridge";

export interface SiteSimilariteInput {
  adresse?: { label?: string | null } | null;
  nomSite?: string | null;
  nomSiteOfficiel?: string | null;
}

export const DICE_SIMILARITY_THRESHOLD = 0.85;

export const bigrams = (value: string): string[] => {
  const normalized = normalize(value);
  if (normalized.length < 2) {
    return normalized.length === 1 ? [normalized] : [];
  }
  const grams: string[] = [];
  for (let i = 0; i < normalized.length - 1; i += 1) {
    grams.push(normalized.slice(i, i + 2));
  }
  return grams;
};

export const diceSimilarity = (a: string, b: string): number => {
  const gramsA = bigrams(a);
  const gramsB = bigrams(b);
  if (gramsA.length === 0 || gramsB.length === 0) {
    return normalize(a) === normalize(b) ? 1 : 0;
  }
  const countB = gramsB.reduce<Map<string, number>>((acc, gram) => {
    acc.set(gram, (acc.get(gram) ?? 0) + 1);
    return acc;
  }, new Map());
  let intersection = 0;
  for (const gram of gramsA) {
    const count = countB.get(gram) ?? 0;
    if (count > 0) {
      intersection += 1;
      countB.set(gram, count - 1);
    }
  }
  return (2 * intersection) / (gramsA.length + gramsB.length);
};

export const classifySiteSimilarite = (
  saisie: SiteSimilariteInput,
  candidate: SiteSimilariteInput,
): SiteSimilariteType => {
  const saisieAdresse = parseAddressLabel(saisie.adresse?.label ?? "");
  const candidateAdresse = parseAddressLabel(candidate.adresse?.label ?? "");

  const sameVille =
    candidateAdresse.ville !== "" &&
    candidateAdresse.ville === saisieAdresse.ville;
  const sameRue =
    candidateAdresse.rue !== "" &&
    saisieAdresse.rue !== "" &&
    diceSimilarity(candidateAdresse.rue, saisieAdresse.rue) >=
      DICE_SIMILARITY_THRESHOLD;
  const sameNumero =
    candidateAdresse.numero !== null &&
    candidateAdresse.numero === saisieAdresse.numero;
  const sameTypeVoie =
    candidateAdresse.typeVoie !== null &&
    candidateAdresse.typeVoie === saisieAdresse.typeVoie;

  const addressIdentical = sameVille && sameRue && sameNumero && sameTypeVoie;

  const saisieName = normalize(
    (saisie.nomSiteOfficiel ?? saisie.nomSite ?? "").trim(),
  );
  const candidateName = normalize(
    (candidate.nomSiteOfficiel ?? candidate.nomSite ?? "").trim(),
  );

  if (addressIdentical) {
    return candidateName !== "" && candidateName !== saisieName
      ? "nomLieu"
      : "adresseComplete";
  }

  if (
    sameVille &&
    sameRue &&
    saisieAdresse.numero !== candidateAdresse.numero &&
    (saisieAdresse.numero !== null || candidateAdresse.numero !== null)
  ) {
    return "numeroVoie";
  }

  if (
    sameVille &&
    sameRue &&
    sameNumero &&
    saisieAdresse.typeVoie !== null &&
    candidateAdresse.typeVoie !== null &&
    candidateAdresse.typeVoie !== saisieAdresse.typeVoie
  ) {
    return "typeVoie";
  }

  return "nomLieu";
};
