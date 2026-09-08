import { ref, type Ref } from "vue";
import type { NestedKeys } from "../components/Table/DsfrDataTableV2.vue";

export type PaginationQuery = {
  limit?: string;
  offset?: string;
  sort?: string;
  sortDirection?: "asc" | "desc" | "";
};

const SORT_DIRECTIONS = ["", "asc", "desc"] as const;

type SortDirection = (typeof SORT_DIRECTIONS)[number];

function isSortDirection(value: string): value is SortDirection {
  return (SORT_DIRECTIONS as readonly string[]).includes(value);
}

export function parsePaginationQuery<T extends string>(
  query: PaginationQuery,
  sortableTitles: T[],
): {
  limit: number;
  offset: number;
  sort: T | undefined;
  sortDirection: SortDirection;
} {
  const limit = parseInt(query.limit ?? "", 10) || 10;
  const offset = parseInt(query.offset ?? "", 10) || 0;
  const sort = sortableTitles.find((title) => title === query.sort);
  const sortDirectionValue = query.sortDirection;
  const sortDirection =
    sortDirectionValue !== undefined && isSortDirection(sortDirectionValue)
      ? sortDirectionValue
      : "";

  return {
    limit,
    offset,
    sort,
    sortDirection,
  };
}

export const usePagination = <T>(
  query: PaginationQuery,
  sortableTitles: NestedKeys<T>[],
): {
  limit: Ref<number>;
  offset: Ref<number>;
  sort: Ref<NestedKeys<T> | "">;
  sortDirection: Ref<"asc" | "desc" | "">;
} => {
  const parsed = parsePaginationQuery(query, sortableTitles);
  return {
    limit: ref(parsed.limit),
    offset: ref(parsed.offset),
    sort: ref(parsed.sort ?? "") as Ref<NestedKeys<T> | "">,
    sortDirection: ref(parsed.sortDirection),
  };
};

export const isValidParams = (params: unknown) =>
  params !== null &&
  params !== "" &&
  (!Array.isArray(params) || params.length > 0);
