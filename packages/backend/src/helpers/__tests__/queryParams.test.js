const {
  applyFilters,
  applyPagination,
  applyGroupBy,
  sanityzeFiltersParams,
  sanityzePaginationParams,
} = require("../queryParams");

describe("queryParams", () => {
  // applyFilters
  it("should return the original query and params if no filters are provided", () => {
    const query = "SELECT * FROM users";
    const result = applyFilters(query, [], {});
    expect(result.query.trim()).toBe(query);
    expect(result.params).toEqual([]);
  });

  it("should apply filters to the query", () => {
    const query = "SELECT * FROM users";
    const filterParams = { age: "30", name: "John" };
    const result = applyFilters(query, [], filterParams);
    // remove return at line to fix space pb
    expect(result.query.replace(/\s+/g, " ").trim()).toContain(
      "unaccent(age::text) ILIKE '%' || unaccent($1) || '%'",
    );
    expect(result.query.replace(/\s+/g, " ").trim()).toContain(
      "unaccent(name::text) ILIKE '%' || unaccent($2) || '%'",
    );
    expect(result.params).toEqual(["30", "John"]);
  });

  it("should apply group by to the query", () => {
    const query = "SELECT age, name, count(*) FROM users";
    const groupParams = ["age", "name"];
    const result = applyFilters(query, [], {});
    result.query = applyGroupBy(query, groupParams);
    // remove return at line to fix space pb
    expect(result.query.replace(/\s+/g, " ").trim()).toContain(
      "GROUP BY age, name",
    );
  });

  it("should handle array filters with ANY", () => {
    const query = "SELECT * FROM users";
    const filterParams = { roles: ["admin", "user"] };
    const result = applyFilters(query, [], filterParams);
    expect(result.query).toContain("roles = ANY($1)");
    expect(result.params).toEqual([["admin", "user"]]);
  });

  it("should return the original query if no parameters are provided", () => {
    const result = applyFilters();
    expect(result.query.trim()).toBe("");
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
    // remove return at line to fix space pb
    expect(result.countQuery.replace(/\s+/g, " ").trim()).toBe(
      "SELECT COUNT(*) AS total FROM (SELECT * FROM users) AS subquery;",
    );
    expect(result.countQueryParams).toEqual(params);
  });

  // sanityzeFiltersParams
  it("should sanitize filter parameters", () => {
    const queryParams = { role: "admin", search: "John" };
    const availableParams = { role: "userRole", search: "name" };
    const result = sanityzeFiltersParams(queryParams, availableParams);
    expect(result).toEqual({ name: "John", userRole: "admin" });
  });

  it("should return an empty object if no valid params are provided", () => {
    const queryParams = { unknown: "test" };
    const availableParams = { search: "name" };
    const result = sanityzeFiltersParams(queryParams, availableParams);
    expect(result).toEqual({});
  });

  // sanityzePaginationParams
  it("should sanitize pagination parameters with defaults", () => {
    const queryParams = {
      limit: "20",
      offset: "5",
      sortBy: "name",
      sortDirection: "ASC",
    };
    const defaultParams = { sortBy: { date: "created_at", name: "name" } };
    const result = sanityzePaginationParams(queryParams, defaultParams);
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
    const defaultParams = { sortBy: { date: "created_at", name: "name" } };
    const result = sanityzePaginationParams(queryParams, defaultParams);
    expect(result).toEqual({
      limit: 10,
      offset: 0,
      sortBy: "",
      sortDirection: "",
    });
  });

  it("should apply default values", () => {
    const result = sanityzePaginationParams();
    expect(result).toEqual({
      limit: 10,
      offset: 0,
      sortBy: "",
      sortDirection: "",
    });
  });
});
