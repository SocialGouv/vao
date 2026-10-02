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
  let addressPart;
  if (parts.length > 1) {
    addressPart = parts[0];
  } else if (cpVilleMatch) {
    addressPart = lastPart.slice(0, cpVilleMatch.index).trim();
  } else {
    addressPart = lastPart;
  }
  if (!addressPart) {
    return { ...EMPTY_ADDRESS, ville };
  }
  const tokens = addressPart.split(/\s+/).filter(Boolean);
  let numero: string | null = null;
  let restTokens = tokens;
  const firstToken = restTokens[0];
  if (firstToken !== undefined && /^\d/.test(firstToken)) {
    numero = firstToken;
    restTokens = restTokens.slice(1);
  }
  let typeVoie: string | null = null;
  const nextToken = restTokens[0];
  if (
    nextToken !== undefined &&
    TYPE_VOIES_NORMALIZED.has(normalize(nextToken))
  ) {
    typeVoie = normalize(nextToken);
    restTokens = restTokens.slice(1);
  }
  const rue = restTokens.map(normalize).join(" ");
  return { numero, rue, typeVoie, ville };
};
