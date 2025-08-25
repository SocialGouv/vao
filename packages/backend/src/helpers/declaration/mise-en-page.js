module.exports.MARGIN_UP_30 = [0, 30, 0, 0];
module.exports.MARGIN_UP_20 = [0, 20, 0, 0];
module.exports.TEXT_LINE_MARGIN = [0, 5, 0, 0];
module.exports.formatLine = (label, value, params = {}) => {
  return {
    columnGap: params.columnGap || 0,
    columns: [
      {
        text: `${label}`,
        width: 250,
      },
      {
        bold: true,
        text: `${value ?? ""}`,
        width: params.withValue || "*",
      },
    ],
    margin: [0, params.marginUp || 5, 0, params.marginRight || 0],
  };
};

module.exports.buildLines = (lines) => {
  return lines.map(([label, value, options]) =>
    module.exports.formatLine(label, value, options),
  );
};
