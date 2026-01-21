import dayjs from "dayjs";

export function isBefore(
  date: string | number | Date,
  dateToCompare: string | number | Date,
) {
  return new Date(date).getTime() < new Date(dateToCompare).getTime();
}

export function isAfter(
  date: string | number | Date,
  dateToCompare: string | number | Date,
) {
  return new Date(date).getTime() > new Date(dateToCompare).getTime();
}

export function addYears(date: Date | null, years: number) {
  return date ? dayjs(date).add(years, "year").toDate() : null;
}
export function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function addMonths(date: Date, months: number) {
  return addDays(date, 30 * months);
}
export function formatFR(date: Date) {
  return dayjs(date).format("DD/MM/YYYY");
}

export function formatFRDateTime(date: Date) {
  return dayjs(date).format("DD/MM/YYYY HH:mm");
}

/**
 *
 * @param Date au format JJ/MM/AAAA
 * @returns Date au format JS (AAAA-MM-JJ) ou null si la valeur est vide
 */
export const parseToISODate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
};
