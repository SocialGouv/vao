import { QueryParams } from "../../types/queryParams";

interface QueryParamsSearch {
  limit?: number;
  offset?: number;
  siren?: string;
  siret?: string;
  dateDebut?: string | Date;
  organismeId?: number;
  idFonctionnelle?: string;
  libelle?: string;
  organisme?: string;
  statuts?: string[];
  action?: string[];
  statut?: string;
  messageEtat?: string;
}

export function mapQueryParams(queryParams: QueryParams): QueryParamsSearch {
  const hasStatuts =
    queryParams.search?.statuts &&
    Object.keys(queryParams.search.statuts).length > 0;

  const queryParamsNew: QueryParamsSearch = {
    limit: queryParams.limit as QueryParamsSearch["limit"],
    offset: queryParams.offset as QueryParamsSearch["offset"],
    ...queryParams.search,
  };

  const queryParamsStatus: QueryParamsSearch = hasStatuts
    ? {
        ...queryParamsNew,
        statuts: queryParams.search?.statuts
          ? (queryParams.search.statuts as string).split(",")
          : [],
      }
    : queryParamsNew;

  return queryParamsStatus;
}
