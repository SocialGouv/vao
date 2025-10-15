module.exports = function getCodeTerritoireByInseeCode({ inseeCode } = {}) {
  if (!inseeCode) return "";
  return inseeCode.startsWith("97")
    ? inseeCode.slice(0, 3)
    : inseeCode.slice(0, 2);
};
