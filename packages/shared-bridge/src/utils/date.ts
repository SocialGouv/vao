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

export function setFormatDateToFRString(date: Date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function setFormatDateAndTimeToFRString(date: Date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${setFormatDateToFRString(date)} ${hours}:${minutes}`;
}
