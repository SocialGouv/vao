export interface QueryParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: string;
  search?: Record<string, string | Date | string[] | number>;
  statut?: string;
}
