module.exports = {
  applyFilters: (query = "", initialParams = [], filterParams = {}) => {
    const params = [...initialParams];
    if (Object.keys(filterParams).length === 0) {
      return {
        params: initialParams,
        query: `${query}`,
      };
    }
    const filters = Object.entries(filterParams)
      .map(([key, value], index) => {
        params.push(value);
        if (Array.isArray(value)) {
          return `${key} = ANY($${initialParams.length + index + 1})`;
        }
        return `unaccent(${key}::text) ILIKE '%' ||  unaccent($${initialParams.length + index + 1}) || '%'`;
      })
      .join(" AND ");
    return {
      params,
      query: `${query} AND ${filters}`,
    };
  },
  applyGroupBy: (queryInitial, groupByParams = []) => {
    if (Object.keys(groupByParams).length === 0) {
      return `${queryInitial}`;
    }
    const group = Object.entries(groupByParams)
      // eslint-disable-next-line no-unused-vars
      .map(([_key, value]) => {
        return value;
      })
      .join(", ");
    return `${queryInitial} GROUP BY ${group}`;
  },

  applyPagination: (
    query,
    params,
    limit = 10,
    offset = 0,
    sortBy = "",
    sortDirection = "ASC",
  ) => {
    const paginatedQuery = `
      ${query}
      ${sortBy ? `ORDER BY ${sortBy} ${sortDirection}` : ""}
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2};
    `;

    const countQuery = `
      SELECT COUNT(*) AS total FROM (${query}) AS subquery;
    `;
    return {
      countQuery,
      countQueryParams: params,
      params: [...params, limit, offset],
      query: paginatedQuery,
    };
  },
  sanityzeFiltersParams: (queryParams, availableParams) => 
    Object.entries(availableParams).reduce((acc, [key, value]) => {
      if (queryParams[key]) {
        acc[value] = queryParams[key];
      }
      return acc;
    }, {}),
  sanityzePaginationParams: (
    { sortBy, sortDirection, limit, offset } = {},
    defaultParams = {},
  ) => {
    const defaultSortDirection = ["", "ASC", "DESC"];
    const defaultLimit = 10;
    const defaultOffset = 0;
    return {
      limit: isNaN(parseInt(limit, 10))
        ? (defaultParams?.limit ?? defaultLimit)
        : parseInt(limit, 10),
      offset: isNaN(parseInt(offset, 10))
        ? (defaultParams?.offset ?? defaultOffset)
        : parseInt(offset, 10),
      sortBy:
        sortBy &&
        Object.prototype.hasOwnProperty.call(defaultParams.sortBy, sortBy)
          ? defaultParams.sortBy[sortBy]
          : "",
      sortDirection: defaultSortDirection.includes(sortDirection)
        ? sortDirection
        : "",
    };
  },
};
