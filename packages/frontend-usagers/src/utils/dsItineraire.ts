import { formatISOShort } from "@vao/shared-bridge";
import type { SiteListeDto } from "@vao/shared-bridge";
import dayjs from "dayjs";

export interface DSItineraireBlock {
  id: string;
  siteId: string;
  dateDebut: string;
  dateFin: string;
}

type SiteAvecIdEtSiteId = Pick<SiteListeDto, "id" | "siteId">;

export const MESSAGE_DATE_DEBUT_AVANT_SEJOUR =
  "La date de début ne doit pas être antérieure au début du séjour";
export const MESSAGE_DATE_LENDEMAIN =
  "La date doit être le lendemain de l’hébergement précédent";
export const MESSAGE_DATE_DEPASSE_SEJOUR =
  "La date dépasse la fin du séjour saisie dans les informations générales";
export const MESSAGE_DATE_FIN_PRECEDE_DEBUT =
  "La date de fin doit être postérieure à la date de début";

export function sortByDateDebut<T extends { dateDebut: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => a.dateDebut.localeCompare(b.dateDebut));
}

export function resolveSiteId(
  sites: SiteAvecIdEtSiteId[],
  hebergementId: number,
): string {
  return sites.find((site) => site.id === hebergementId)?.siteId ?? "";
}

export function recalcDatesLendemain(
  blocks: DSItineraireBlock[],
  dateDebutSejour: string | Date | null,
  fromIndex: number,
): DSItineraireBlock[] {
  if (blocks.length === 0) {
    return [];
  }
  const arr = blocks.map((block) => ({ ...block }));
  const debutSejour = formatISOShort(dateDebutSejour);
  if (arr[0]) {
    arr[0]!.dateDebut = debutSejour ?? arr[0]!.dateDebut;
  }
  for (let i = Math.max(fromIndex, 0); i < arr.length; i++) {
    if (i > 0 && arr[i - 1]!.dateFin) {
      arr[i]!.dateDebut = dayjs(arr[i - 1]!.dateFin)
        .add(1, "day")
        .format("YYYY-MM-DD");
    }
  }
  return arr;
}

export function dateDebutCoherenceError(
  blocks: DSItineraireBlock[],
  dateDebutSejour: string | Date | null,
  index: number,
): string {
  const block = blocks[index];
  if (!block || !block.dateDebut) {
    return "";
  }
  if (
    index === 0 &&
    block.dateDebut < (formatISOShort(dateDebutSejour) ?? "")
  ) {
    return MESSAGE_DATE_DEBUT_AVANT_SEJOUR;
  }
  if (index > 0) {
    const prev = blocks[index - 1];
    if (prev && prev.dateFin) {
      const expected = dayjs(prev.dateFin).add(1, "day").format("YYYY-MM-DD");
      if (block.dateDebut !== expected) {
        return MESSAGE_DATE_LENDEMAIN;
      }
    } else {
      return MESSAGE_DATE_LENDEMAIN;
    }
  }
  return "";
}

export function dateFinCoherenceError(
  blocks: DSItineraireBlock[],
  dateFinSejour: string | Date | null,
  index: number,
): string {
  const block = blocks[index];
  if (!block || !block.dateFin) {
    return "";
  }
  if (block.dateFin > (formatISOShort(dateFinSejour) ?? "")) {
    return MESSAGE_DATE_DEPASSE_SEJOUR;
  }
  if (block.dateDebut && block.dateFin < block.dateDebut) {
    return MESSAGE_DATE_FIN_PRECEDE_DEBUT;
  }
  return "";
}
