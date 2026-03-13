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

export function isBetweenDates(
  date: string | number | Date,
  start: string | number | Date,
  end: string | number | Date,
) {
  const d = new Date(date).getTime();
  return d >= new Date(start).getTime() && d <= new Date(end).getTime();
}

export function daysBetween(
  date1: string | number | Date,
  date2: string | number | Date,
) {
  const diff = new Date(date2).getTime() - new Date(date1).getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function addYears(date: Date | null, years: number) {
  return date ? dayjs(date).add(years, "year").toDate() : null;
}

export function addDays(date: Date, days: number) {
  return dayjs(date).add(days, "day").toDate();
}

export function addMonths(date: Date, months: number) {
  return dayjs(date).add(months, "month").toDate();
}

export function formatFR(date: Date) {
  return dayjs(date).format("DD/MM/YYYY");
}

export function formatFRDateTime(date: Date) {
  return dayjs(date).format("DD/MM/YYYY HH:mm");
}

export function formatFRTime(date: Date) {
  return dayjs(date).format("HH:mm");
}

export function getYear4k(date: Date) {
  return dayjs(date).format("YYYY");
}

/**
 * JJ/MM/AAAA -> AAAA-MM-JJ
 */
export const parseToISODate = (dateString: string | null): string | null => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
};
