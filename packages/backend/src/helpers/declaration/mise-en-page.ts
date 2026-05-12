export const MARGIN_UP_30 = [0, 30, 0, 0];
export const MARGIN_UP_20 = [0, 20, 0, 0];
export const TEXT_LINE_MARGIN = [0, 5, 0, 0];
export const formatLine = (
  label: string,
  value: string,
  params: {
    columnGap?: number;
    withValue?: number;
    marginUp?: number;
    marginRight?: number;
  } = {},
) => {
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
export const buildLines = (
  lines: [
    string,
    string,
    {
      columnGap?: number;
      withValue?: number;
      marginUp?: number;
      marginRight?: number;
    },
  ][],
  optionsOverload: {
    columnGap?: number;
    withValue?: number;
    marginUp?: number;
    marginRight?: number;
  } = {},
) => {
  if (!Array.isArray(lines) || lines.length === 0) return [];

  return lines
    .filter((line) => Array.isArray(line) && line.length >= 2)
    .map(([label, value, options]) => {
      const finalOptions =
        Object.keys(optionsOverload).length > 0
          ? optionsOverload
          : options || {};

      return formatLine(label, value, finalOptions);
    });
};
