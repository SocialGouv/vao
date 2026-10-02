import type {
  SiteSimilariteResult,
  SiteSimilariteType,
} from "@vao/shared-bridge";
import { parseAddressLabel } from "@vao/shared-bridge";

export interface SimilarityGroup {
  type: SiteSimilariteType;
  title: LabelSegment[];
  items: SiteSimilariteResult[];
  names: string[];
}

export interface LabelSegment {
  text: string;
  bold: boolean;
}

const SIMILARITY_TYPE_ORDER: SiteSimilariteType[] = [
  "numeroVoie",
  "typeVoie",
  "adresseComplete",
  "nomLieu",
];

function officialName(similarite: SiteSimilariteResult): string {
  return similarite.nomSiteOfficiel ?? similarite.nomSite ?? "";
}

function byCount(count: number): string {
  return count > 1 ? "par d’autres organismes" : "par un autre organisme";
}

function buildTitle(type: SiteSimilariteType, count: number): LabelSegment[] {
  switch (type) {
    case "numeroVoie":
      return [
        { text: "Le numéro de la voie", bold: true },
        {
          text: ` de l’adresse saisie pour cet hébergement est différente de celle renseignée ${byCount(count)}`,
          bold: false,
        },
      ];
    case "typeVoie":
      return [
        { text: "Le type de voie", bold: true },
        {
          text: ` pour l’adresse saisie pour cet hébergement est différent de celle renseignée ${byCount(count)}`,
          bold: false,
        },
      ];
    case "adresseComplete":
      return [
        { text: "L’adresse saisie", bold: true },
        {
          text: ` pour cet hébergement est déjà renseignée ${byCount(count)}`,
          bold: false,
        },
      ];
    case "nomLieu":
      return [
        { text: "Des ", bold: false },
        { text: "noms de lieux", bold: true },
        {
          text: " différents ont été renseignés par d’autres organismes à cette adresse :",
          bold: false,
        },
      ];
  }
}

function indexOfCaseInsensitive(text: string, needle: string): number {
  return text.toLowerCase().indexOf(needle.toLowerCase());
}

function highlightSegments(
  text: string,
  needle: string | null,
): LabelSegment[] {
  if (!needle) {
    return [{ text, bold: false }];
  }
  const index = indexOfCaseInsensitive(text, needle);
  if (index === -1) {
    return [{ text, bold: false }];
  }
  const before = text.slice(0, index);
  const match = text.slice(index, index + needle.length);
  const after = text.slice(index + needle.length);
  const segments: LabelSegment[] = [];
  if (before) {
    segments.push({ text: before, bold: false });
  }
  segments.push({ text: match, bold: true });
  if (after) {
    segments.push({ text: after, bold: false });
  }
  return segments;
}

export function highlightLabelSegments(
  address: string,
  type: SiteSimilariteType,
): LabelSegment[] {
  if (!address) {
    return [];
  }
  if (type === "adresseComplete") {
    return [{ text: address, bold: true }];
  }
  if (type === "nomLieu") {
    return [{ text: address, bold: false }];
  }
  const parsed = parseAddressLabel(address);
  const needle = type === "numeroVoie" ? parsed.numero : parsed.typeVoie;
  return highlightSegments(address, needle);
}

export function similarLabelSegments(
  similarite: SiteSimilariteResult,
  type: SiteSimilariteType,
): LabelSegment[] {
  const name = officialName(similarite);
  const address = similarite.adresse?.label ?? "";
  const addressSegments = highlightLabelSegments(address, type);
  if (!name) {
    return addressSegments;
  }
  if (address) {
    return [...addressSegments, { text: ` (${name})`, bold: false }];
  }
  return [{ text: name, bold: false }];
}

export function buildSimilarityGroups(
  similarites: SiteSimilariteResult[],
): SimilarityGroup[] {
  const byType = new Map<SiteSimilariteType, SiteSimilariteResult[]>();
  for (const similarite of similarites) {
    const items = byType.get(similarite.similarite) ?? [];
    items.push(similarite);
    byType.set(similarite.similarite, items);
  }

  return SIMILARITY_TYPE_ORDER.filter((type) => byType.has(type)).map(
    (type) => {
      const items = byType.get(type) ?? [];
      const names =
        type === "nomLieu"
          ? Array.from(new Set(items.map((item) => officialName(item)))).filter(
              Boolean,
            )
          : [];
      return {
        type,
        title: buildTitle(type, items.length),
        items,
        names,
      };
    },
  );
}
