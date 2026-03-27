export const optionType = {
  SORTABLE: "sortable",
  FIXED_RIGHT: "fixedRight",
  NONE: "none",
};

export function buildColumns(defs: [string, string, string][]) {
  return defs.map(
    ([key, label, type = optionType.NONE]: [string, string, string]) => {
      let options: Record<string, any> = {};

      switch (type) {
        case optionType.SORTABLE:
          options = { isSortable: true };
          break;
        case optionType.FIXED_RIGHT:
          options = { isFixedRight: true };
          break;
        case optionType.NONE:
        default:
          options = {};
          break;
      }

      return { key, label, options };
    },
  );
}
