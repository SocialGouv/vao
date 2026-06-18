export function escapeCsvField(field: string | number | boolean) {
  if (typeof field !== "string") {
    return `${field}`;
  }
  if (field.includes('"') || field.includes(";") || field.includes("\n")) {
    const fieldEscaped = field.replace(/"/g, '""');
    return `"${fieldEscaped}"`;
  }
  return field;
}
