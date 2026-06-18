export function normalizeFilename(filename: string): string {
  const decoded = new TextDecoder("utf-8").decode(
    Uint8Array.from(filename, (c) => c.charCodeAt(0)),
  );

  const lastDot = decoded.lastIndexOf(".");
  const name = lastDot !== -1 ? decoded.slice(0, lastDot) : decoded;
  const extension = lastDot !== -1 ? decoded.slice(lastDot) : "";

  const sanitized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return sanitized + extension;
}
