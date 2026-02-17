import { QueryParams } from "../../types/queryParams";

interface QueryParamsSearch {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: string;
  siret?: string;
  dateDepot?: string | Date;
  names?: string;
  statut?: string[];
}

export function mapQueryParams(queryParams: QueryParams): QueryParamsSearch {
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
