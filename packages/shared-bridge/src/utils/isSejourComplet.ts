import dayjs from "dayjs";

import { formatISOShort } from "./date";

export interface HebergementPeriodeDto {
  dateDebut?: string | Date | null;
  dateFin?: string | Date | null;
}

export function isSejourComplet(
  hebergements: HebergementPeriodeDto[],
  dateDebut: string | Date | null,
  dateFin: string | Date | null,
): boolean {
  if (hebergements.length === 0) {
    return false;
  }

  const dateDebutSejour = formatISOShort(dateDebut);
  const dateFinSejour = formatISOShort(dateFin);
  if (!dateDebutSejour || !dateFinSejour) {
    return false;
  }

  let expectedDateDebut = dayjs(dateDebutSejour);

  for (const hebergement of hebergements) {
    const hebergementDateDebut = formatISOShort(hebergement.dateDebut);
    if (
      !hebergementDateDebut ||
      hebergementDateDebut !== formatISOShort(expectedDateDebut)
    ) {
      return false;
    }
    const hebergementDateFin = formatISOShort(hebergement.dateFin);
    if (!hebergementDateFin) {
      return false;
    }
    expectedDateDebut = dayjs(hebergementDateFin).add(1, "day");
  }

  return formatISOShort(expectedDateDebut.subtract(1, "day")) === dateFinSejour;
}
