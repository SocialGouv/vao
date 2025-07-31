const getSort = (sortBy, direction, titles, defaultSort = "") => {
  if (sortBy && direction) {
    const title = titles.find((t) => t.queryKey === sortBy && t.sortEnabled);
    if (title) {
      if (title.customSort) {
        return title.customSort(sortBy, direction);
      }
      if (title?.sortType === "date") {
        return `ORDER BY ${title.sortQuery ?? title.key} ${direction}`;
      }
      return `ORDER BY LOWER(${title.sortQuery ?? title.key}::varchar) ${direction}`;
    }
    return `ORDER BY LOWER(${defaultSort}::varchar) ${direction}`;
  }
  return "";
};

const getSortDirection = (sortDirection, defaultSortDirection) => {
  const possibleSortDirections = ["", "ASC", "DESC"];
  if (sortDirection) {
    return possibleSortDirections.includes(sortDirection) ? sortDirection : "";
  }
  return possibleSortDirections.includes(defaultSortDirection)
    ? defaultSortDirection
    : "";
};

const sanitizeFiltersParams = (queryParams, filters) =>
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
  }, []);

const sanitizePaginationParams = (
  { sortBy, sortDirection, limit, offset } = {},
  titles,
  defaultParams = {},
) => {
  const defaultLimit = 10;
  const defaultOffset = 0;
  const direction = getSortDirection(
    sortDirection,
    defaultParams.sortDirection,
  );
  const sort = getSort(sortBy, direction, titles, defaultParams.sortBy);
  return {
    limit: isNaN(parseInt(limit, 10))
      ? (defaultParams?.limit ?? defaultLimit)
      : parseInt(limit, 10),
    offset: isNaN(parseInt(offset, 10))
      ? (defaultParams?.offset ?? defaultOffset)
      : parseInt(offset, 10),
    sort,
  };
};

const applyFilters = (query, initialParams, filters, groupBy = "") => {
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
        return `unaccent(${filter.key}::text) ILIKE '%' || unaccent($${initialParams.length + index + 1}) || '%'`;
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
          return `${customFilter.query}`;
        }
      }
      return null;
    })
    .filter(Boolean)
    .join(" AND ");

  let newQuery = `${query} AND ${filteringQuery}`;
  if (groupBy) {
    newQuery += `\n${groupBy}\n`;
  }

  return {
    params,
    query: newQuery,
  };
};

const applyGroupBy = (queryInitial, groupByParams = []) => {
  if (Object.keys(groupByParams).length === 0) {
    return queryInitial;
  }
  const group = Object.values(groupByParams).join(", ");
  return `${queryInitial} GROUP BY ${group}`;
};

const applyPagination = (query, params, limit = 10, offset = 0, sort = "") => {
  const hasLimit = limit !== -1;

  const paginatedQuery = `
    ${query}
    ${sort}
    ${hasLimit ? `LIMIT $${params.length + 1} OFFSET $${params.length + 2}` : ""}
  `;

  const countQuery = `
    SELECT COUNT(*) AS total FROM (${query}) AS subquery;
  `;

  return {
    countQuery,
    countQueryParams: params,
    params: hasLimit ? [...params, limit, offset] : params,
    query: paginatedQuery,
  };
};

const processQuery = (
  queryBuilder,
  baseParams,
  titles,
  queryParams,
  defaultSort = {},
) => {
  const filterParams = sanitizeFiltersParams(queryParams, titles);
  const baseQuery = queryBuilder();
  const filteredQuery = applyFilters(baseQuery, baseParams, filterParams);
  const { limit, offset, sort } = sanitizePaginationParams(
    queryParams,
    titles,
    defaultSort,
  );
  return applyPagination(
    filteredQuery.query,
    filteredQuery.params,
    limit,
    offset,
    sort,
  );
};

module.exports = {
  applyFilters,
  applyGroupBy,
  applyPagination,
  processQuery,
  sanitizeFiltersParams,
  sanitizePaginationParams,
};
