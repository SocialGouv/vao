import { ref } from "vue";
import type { NestedKeys } from "../components/Table/DsfrDataTableV2.vue";

export const usePagination = <T>(
  query: {
    limit: string;
    offset: string;
    sort: string;
    sortDirection: "asc" | "desc" | "";
  },
  sortableTitles: NestedKeys<T>[],
) => {
  const limit = ref(parseInt(query.limit, 10) || 10);
  const offset = ref(parseInt(query.offset, 10) || 0);
  const sort = ref<NestedKeys<T>>(
    // @ts-expect-error - query.sort is a NestedKeys<T>
    sortableTitles.includes(query.sort) ? query.sort : undefined,
  );
  const sortDirection = ref<"asc" | "desc" | "">(
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
