import { QueryParams } from "../types/reorgQueryParams";

export function reorgQueryParams(queryParams: QueryParams) {
  const hasStatuts =
    queryParams?.search?.statuts &&
    Object.keys(queryParams.search.statuts).length > 0;

  const hasOrganismeId =
    queryParams?.search?.organismeId &&
    Object.keys(queryParams.search?.organismeId ?? {}).length > 0;

  const queryParamsNew = {
    ...queryParams,
    ...queryParams.search,
    ...(hasOrganismeId
      ? {
          organismeId: queryParams.search?.organismeId,
        }
      : {}),
  };

  const queryParamsStatus = hasStatuts
    ? {
        ...queryParamsNew,
        statuts: queryParamsNew?.statuts
          ? queryParamsNew.statuts.split(",")
          : [],
      }
    : queryParamsNew;
  delete queryParamsStatus.search;

  return queryParamsStatus;
}
