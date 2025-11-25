const optionType = {
  SORTABLE: "sortable",
  FIXED_RIGHT: "fixedRight",
  NONE: "none",
};

function buildColumns(defs) {
  return defs.map(([key, label, type = optionType.NONE]) => {
    let options = {};

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
  });
}

export default {
  optionType,
  buildColumns,
};
