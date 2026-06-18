export interface PaginationQueryDto {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
