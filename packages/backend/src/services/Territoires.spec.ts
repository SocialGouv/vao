import { getPool } from "../utils/pgpool";
import ficheTerritoire from "./Territoire";

jest.mock("../utils/error", () => ({
  default: jest.fn(),
}));

jest.mock("../utils/pgpool", () => {
  const mockQuery = jest.fn();
  return {
    __mockQuery: mockQuery,
    getPool: jest.fn(() => ({ query: mockQuery })),
  };
});

describe("Service Territoire", () => {
  describe("getFichesTerritoireForRegionByInseeCode", () => {
    it("should return a valid id for any valid inseeCode", async () => {
      const pool = getPool();

      (pool.query as jest.Mock).mockImplementation(
        (sql: string, params: any[]) => {
          expect(sql).toMatch(/SELECT/);
          expect(params).toEqual(["972"]);
          return Promise.resolve({ rows: [{ id: 12, terCode: "MAR" }] });
        },
      );

      const result =
        await ficheTerritoire.getFichesTerritoireForRegionByInseeCode({
          inseeCode: "97200",
        });

      expect(result).toEqual({ id: 12, terCode: "MAR" });
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});
