export interface Search {
  name?: string;
  numero?: string;
  siret?: string;
  statut?: string;
}

export interface QueryParamsSearch {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: string;
  search?: Search;
}

export function parseQueryParams(query: QueryParamsSearch): QueryParamsSearch {
  return {
    limit: Number(query.limit) || 10,
    offset: Number(query.offset) || 0,
    search: query.search ? JSON.parse(query.search) : "",
    sortBy: query.sortBy ? query.sortBy : "",
    sortDirection: query.sortDirection ? query.sortDirection : "",
  };
}
export function mapQueryParams(
  queryParams: QueryParamsSearch,
): QueryParamsSearch {
  const queryParamsNew: QueryParamsSearch = {
    limit: queryParams.limit as QueryParamsSearch["limit"],
    offset: queryParams.offset as QueryParamsSearch["offset"],
    sortBy: queryParams?.sortBy as QueryParamsSearch["sortBy"],
    sortDirection:
      queryParams?.sortDirection as QueryParamsSearch["sortDirection"],
    ...queryParams.search,
  };

  return queryParamsNew;
}
