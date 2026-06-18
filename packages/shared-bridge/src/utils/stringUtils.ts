export function formatLabel(value = "") {
  const formatted = value.replace(/_/g, " ").toLowerCase();
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
