jest.mock("../../utils/error");
const pgpool = require("../../utils/pgpool");

jest.mock("../../utils/pgpool", () => {
  const mockQuery = jest.fn();
  return {
    getPool: jest.fn(() => ({ query: mockQuery })),
    __mockQuery: mockQuery,
  };
});

describe("Service Territoire", () => {
  describe("getFichesTerritoireForRegionByInseeCode", () => {
    it("should return a valid id", async () => {
      const pool = pgpool.getPool();

      pool.query.mockImplementation((sql, params) => {
        expect(sql).toMatch(/SELECT/);
        expect(params).toEqual(["972"]);
        return Promise.resolve({ rows: [{ id: 11 }] });
      });

      const ficheTerritoire = require("../Territoire");
      const result =
        await ficheTerritoire.getFichesTerritoireForRegionByInseeCode("97200");

      expect(result).toEqual({ id: 11 });
      expect(pool.query).toHaveBeenCalledTimes(1);
    });

    it("should return a valid id when code insee is on of DROM", async () => {
      const pool = pgpool.getPool();

      pool.query.mockImplementation((sql, params) => {
        expect(sql).toMatch(/SELECT/);
        expect(params).toEqual(["972"]);
        return Promise.resolve({ rows: [{ id: 11 }] });
      });

      const ficheTerritoire = require("../Territoire");
      const result =
        await ficheTerritoire.getFichesTerritoireForRegionByInseeCode("97200");

      expect(result).toEqual({ id: 11 });
      expect(pool.query).toHaveBeenCalledTimes(2);
    });

    it("should return id when code insee is Corse", async () => {
      const pool = pgpool.getPool();

      pool.query.mockImplementation((sql, params) => {
        expect(sql).toMatch(/SELECT/);
        expect(params).toEqual(["2A"]);
        return Promise.resolve({ rows: [{ id: 11 }] });
      });

      const ficheTerritoire = require("../Territoire");
      const result =
        await ficheTerritoire.getFichesTerritoireForRegionByInseeCode("2A200");

      expect(result).toEqual({ id: 11 });
      expect(pool.query).toHaveBeenCalledTimes(3);
    });
  });
});
