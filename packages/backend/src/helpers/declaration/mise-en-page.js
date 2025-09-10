module.exports.MARGIN_UP_30 = [0, 30, 0, 0];
module.exports.MARGIN_UP_20 = [0, 20, 0, 0];
module.exports.TEXT_LINE_MARGIN = [0, 5, 0, 0];
module.exports.formatLine = (label, value, params = {}) => {
  return {
    columnGap: params.columnGap || 0,
    columns: [
      {
        bold: true,
        text: `${label}`,
        width: 250,
      },
      {
        text: `${value ?? ""}`,
        width: params.withValue || "*",
      },
    ],
    margin: [0, params.marginUp ?? 5, 0, params.marginRight ?? 0],
  };
};
module.exports.buildLines = (lines, optionsOverload = {}) => {
  if (!Array.isArray(lines) || lines.length === 0) return [];

  return lines
    .filter((line) => Array.isArray(line) && line.length >= 2)
    .map(([label, value, options]) => {
      const finalOptions =
        Object.keys(optionsOverload).length > 0
          ? optionsOverload
          : options || {};

      return module.exports.formatLine(label, value, finalOptions);
    });
};
