export interface QueryParams {
  limit?: number;
  offset?: number;
  search?: Record<string, string | Date | string[] | number>;
  statut?: string;
}
