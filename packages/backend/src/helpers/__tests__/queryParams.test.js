const {
  applyFilters,
  applyGroupBy,
  applyPagination,
  sanitizeFiltersParams,
  sanitizePaginationParams,
} = require("../queryParams");

describe("queryParams", () => {
  // applyFilters
  it("should return the original query and params if no filters are provided", () => {
    const query = "SELECT * FROM users";
    const result = applyFilters(query, [], [], "GROUP BY id");
    expect(result.query.trim()).toBe(`${query}\nGROUP BY id\n`.trim());
    expect(result.params).toEqual([]);
  });

  it("should apply filters to the query", () => {
    const query = "SELECT * FROM users";
    const filters = [
      { key: "age", type: "number", value: 30 },
      { key: "name", type: "default", value: "John" },
      { key: "steps", type: "number", value: [1, 5, 10] },
      {
        key: "enemys",
        type: "default",
        value: ["Joe", "Jack", "William", "Averel"],
      },
    ];
    const result = applyFilters(query, [], filters);
    expect(result.query.replace(/\s+/g, " ").trim()).toContain("age = $1");
    expect(result.query.replace(/\s+/g, " ").trim()).toContain(
      "unaccent(name::text) ILIKE '%' || unaccent($2) || '%'",
    );
    expect(result.query.replace(/\s+/g, " ").trim()).toContain("steps IN ($3)");
    expect(result.query.replace(/\s+/g, " ").trim()).toContain(
      "enemys = ANY($4)",
    );

    expect(result.params).toEqual([
      30,
      "John",
      [1, 5, 10],
      ["Joe", "Jack", "William", "Averel"],
    ]);
  });

  it("should apply group by to the query", () => {
    const query = "SELECT age, name, count(*) FROM users";
    const groupParams = ["age", "name"];
    const result = applyFilters(query, [], []);
    result.query = applyGroupBy(query, groupParams);
    // remove return at line to fix space pb
    expect(result.query.replace(/\s+/g, " ").trim()).toContain(
      "GROUP BY age, name",
    );
  });

  it("should handle array filters with ANY", () => {
    const query = "SELECT * FROM users";
    const filters = [
      { key: "roles", type: "default", value: ["admin", "user"] },
    ];
    const result = applyFilters(query, [], filters);
    expect(result.query).toContain("roles = ANY($1)");
    expect(result.params).toEqual([["admin", "user"]]);
  });

  it("should return the original query if filters array is empty", () => {
    const query = "SELECT * FROM users";
    const result = applyFilters(query, [], []);
    expect(result.query).toBe(query);
    expect(result.params).toEqual([]);
  });

  // applyPagination
  it("should apply pagination to the query", () => {
    const query = "SELECT * FROM users";
    const params = [];
    const result = applyPagination(query, params, 10, 5, "name", "DESC");
    expect(result.query).toContain("ORDER BY name DESC");
    expect(result.query).toContain("LIMIT $1");
    expect(result.query).toContain("OFFSET $2");
    expect(result.params).toEqual([10, 5]);
  });

  it("should return count query", () => {
    const query = "SELECT * FROM users";
    const params = [];
    const result = applyPagination(query, params);
    expect(result.countQuery.replace(/\s+/g, " ").trim()).toBe(
      "SELECT COUNT(*) AS total FROM (SELECT * FROM users) AS subquery;",
    );
    expect(result.countQueryParams).toEqual(params);
  });

  // sanitizeFiltersParams
  it("should sanitize filter parameters", () => {
    const queryParams = { role: "admin", search: "John" };
    const filters = [
      { key: "userRole", queryKey: "role", type: "default" },
      { key: "name", queryKey: "search", type: "default" },
    ];
    const result = sanitizeFiltersParams(queryParams, filters);
    expect(result).toEqual([
      { key: "userRole", queryKey: "role", type: "default", value: "admin" },
      { key: "name", queryKey: "search", type: "default", value: "John" },
    ]);
  });

  it("should return an empty array if no valid params are provided", () => {
    const queryParams = { unknown: "test" };
    const filters = [{ key: "name", queryKey: "search", type: "default" }];
    const result = sanitizeFiltersParams(queryParams, filters);
    expect(result).toEqual([]);
  });

  // sanitizePaginationParams
  it("should sanitize pagination parameters with defaults", () => {
    const queryParams = {
      limit: "20",
      offset: "5",
      sortBy: "name",
      sortDirection: "ASC",
    };
    const titles = [{ filterEnabled: true, key: "name", queryKey: "name" }];
    const result = sanitizePaginationParams(queryParams, titles, {
      sortBy: "created_at",
    });
    expect(result).toEqual({
      limit: 20,
      offset: 5,
      sortBy: "name",
      sortDirection: "ASC",
    });
  });

  it("should apply default pagination parameters if invalid inputs are provided", () => {
    const queryParams = {
      limit: "abc",
      offset: "xyz",
      sortBy: "invalid",
      sortDirection: "INVALID",
    };
    const titles = [{ filterEnabled: true, key: "name", queryKey: "name" }];
    const result = sanitizePaginationParams(queryParams, titles, {
      sortBy: "created_at",
    });
    expect(result).toEqual({
      limit: 10,
      offset: 0,
      sortBy: "created_at",
      sortDirection: "",
    });
  });

  it("should apply default values", () => {
    const result = sanitizePaginationParams();
    expect(result).toEqual({
      limit: 10,
      offset: 0,
      sortBy: "",
      sortDirection: "",
    });
  });
});
