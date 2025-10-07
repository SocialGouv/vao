import { ref } from "vue";

export const usePagination = (
  query: Record<string, string>,
  sortableTitles: string[],
) => {
  const limit = ref(parseInt(query.limit, 10) || 10);
  const offset = ref(parseInt(query.offset, 10) || 0);
  const sort = ref(sortableTitles.includes(query.sort) ? query.sort : "");
  const sortDirection = ref(
    ["", "asc", "desc"].includes(query.sortDirection)
      ? query.sortDirection
      : "",
  );

  return {
    limit,
    offset,
    sort,
    sortDirection,
  };
};

export const isValidParams = (params: unknown) =>
  params !== null &&
  params !== "" &&
  (!Array.isArray(params) || params.length > 0);
