module.exports = {
  applyFilters: (query, initialParams, filters, groupBy = "") => {
    if (filters.length === 0) {
      let newQuery = query;
      if (groupBy) {
        newQuery += `\n${groupBy}\n`;
      }
      return {
        params: initialParams,
        query: newQuery,
      };
    }
    const params = [...initialParams];
    const filteringQuery = filters
      .map((filter, index) => {
        if (filter.type === "default") {
          params.push(filter.value);
          if (Array.isArray(filter.value)) {
            return `${filter.key} = ANY($${initialParams.length + index + 1})`;
          }
          return `unaccent(${filter.key}::text) ILIKE '%' ||  unaccent($${initialParams.length + index + 1}) || '%'`;
        }
        if (filter.type === "number") {
          params.push(filter.value);
          if (Array.isArray(filter.value)) {
            return `${filter.key} IN ($${initialParams.length + index + 1})`;
          }
          return `${filter.key} = $${initialParams.length + index + 1}`;
        }
        if (filter.type === "custom") {
          const customFilter = filter.query(
            initialParams.length + index + 1,
            filter.value,
          );
          if (customFilter.query) {
            params.push(...customFilter.queryParams);
            return `${customFilter.query}\n`;
          }
        }
        return null;
      })
      .filter((filter) => filter)
      .join(" AND ");
    let newQuery = `${query} AND ${filteringQuery}`;
    if (groupBy) {
      newQuery += `\n${groupBy}\n`;
    }
    return {
      params,
      query: newQuery,
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
  sanitizeFiltersParams: (queryParams, filters) =>
    filters.reduce((acc, filter) => {
      const value = queryParams[filter.queryKey];
      if (value !== undefined && value !== null) {
        if (
          (filter.type === "default" &&
            (typeof value === "string" ||
              (Array.isArray(value) &&
                value.every((e) => typeof e === "string")))) ||
          (filter.type === "number" &&
            (typeof value === "number" ||
              (Array.isArray(value) &&
                value.every((e) => typeof e === "number"))))
        ) {
          acc.push({ ...filter, value });
        } else if (filter.type === "custom") {
          acc.push({ ...filter, value });
        }
      }
      return acc;
    }, []),
  sanitizePaginationParams: (
    { sortBy, sortDirection, limit, offset } = {},
    titles,
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
      sortBy: getSort(sortBy, titles, defaultParams.sortBy),
      sortDirection: defaultSortDirection.includes(sortDirection)
        ? sortDirection
        : "",
    };
  },
};

const getSort = (sortBy, titles, defaultSort = "") => {
  if (sortBy) {
    const title = titles.find((t) => t.queryKey === sortBy && t.sortEnabled);
    if (title) {
      return title.key;
    }
  }
  return defaultSort;
};
