import type { SiteSimilariteType } from "@vao/shared-bridge";

export interface SiteSimilariteInput {
  adresse?: { label?: string | null } | null;
  nomSite?: string | null;
  nomSiteOfficiel?: string | null;
}

export interface ParsedAddress {
  numero: string | null;
  typeVoie: string | null;
  rue: string;
  ville: string;
}

const EMPTY_ADDRESS: ParsedAddress = {
  numero: null,
  rue: "",
  typeVoie: null,
  ville: "",
};

const TYPE_VOIES = [
  "rue",
  "route",
  "avenue",
  "boulevard",
  "impasse",
  "place",
  "chemin",
  "allee",
  "cours",
  "quai",
  "square",
  "passage",
  "rond-point",
  "promenade",
  "esplanade",
  "sentier",
  "voie",
  "lieu-dit",
  "hameau",
  "domaine",
  "residence",
  "villa",
  "cite",
  "lotissement",
  "montee",
  "traverse",
  "passerelle",
];

export const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/'/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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

const TYPE_VOIES_NORMALIZED = new Set(TYPE_VOIES.map(normalize));

export const parseAddressLabel = (
  label: string | null | undefined,
): ParsedAddress => {
  if (!label) {
    return { ...EMPTY_ADDRESS };
  }
  const parts = label
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  const lastPart = parts[parts.length - 1] ?? "";
  const cpVilleMatch = /\b(\d{5})\s+([\p{L}][\p{L}\s'’-]*)$/u.exec(lastPart);
  const ville = cpVilleMatch
    ? normalize(`${cpVilleMatch[1]} ${cpVilleMatch[2]}`.trim())
    : normalize(lastPart);
  const addressPart =
    parts.length > 1
      ? parts[0]
      : cpVilleMatch
        ? lastPart.slice(0, cpVilleMatch.index).trim()
        : lastPart;
  if (!addressPart) {
    return { ...EMPTY_ADDRESS, ville };
  }
  const tokens = addressPart.split(/\s+/).filter(Boolean);
  let numero: string | null = null;
  let restTokens = tokens;
  if (tokens.length > 0 && /^\d/.test(tokens[0])) {
    numero = tokens[0];
    restTokens = tokens.slice(1);
  }
  let typeVoie: string | null = null;
  if (
    restTokens.length > 0 &&
    TYPE_VOIES_NORMALIZED.has(normalize(restTokens[0]))
  ) {
    typeVoie = normalize(restTokens[0]);
    restTokens = restTokens.slice(1);
  }
  const rue = restTokens.map(normalize).join(" ");
  return { numero, rue, typeVoie, ville };
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
