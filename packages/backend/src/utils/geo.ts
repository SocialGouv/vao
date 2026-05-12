export function getCodeTerritoireByInseeCode(params?: {
  inseeCode?: string | null;
}) {
  const inseeCode = params?.inseeCode;
  if (!inseeCode) return "";
  return inseeCode.startsWith("97")
    ? inseeCode.slice(0, 3)
    : inseeCode.slice(0, 2);
}
