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
