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
    it("should return a valid id for any valid inseeCode", async () => {
      const pool = pgpool.getPool();

      pool.query.mockImplementation((sql, params) => {
        expect(sql).toMatch(/SELECT/);
        expect(params).toEqual(["972"]);
        return Promise.resolve({ rows: [{ id: 12, terCode: "MAR" }] });
      });

      const ficheTerritoire = require("../Territoire");
      const result =
        await ficheTerritoire.getFichesTerritoireForRegionByInseeCode({
          inseeCode: "97200",
        });

      expect(result).toEqual({ id: 12, terCode: "MAR" });
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});
