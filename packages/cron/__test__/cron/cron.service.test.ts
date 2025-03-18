import { describe, it, expect, vi } from "vitest";
import { insertCron } from "../../src/cron/cron.service";
import { pool } from "../../src/db";
import { QueryResult } from "pg";
import type { InsertParams } from "../../src/cron/cron.type";

describe("insertCron", () => {
  it("should execute a query with the correct SQL and parameters", async () => {
    const result: InsertParams = {
      cronName: "testCron",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      report: {},
    };

    const querySpy: ReturnType<typeof vi.spyOn> = vi.spyOn(pool, "query");
    const fakeResult: QueryResult<InsertParams> = {
      rows: [result],
      command: "INSERT",
      rowCount: 1,
      oid: 0,
      fields: [],
    };

    querySpy.mockResolvedValue(fakeResult);

    await insertCron(result);

    expect(querySpy).toHaveBeenCalled();
    const [sql, queryParams] = querySpy.mock.calls[0];

    expect(sql).toContain("INSERT INTO back.crons");
    expect(queryParams).toEqual([
      result.cronName,
      result.startDate,
      result.endDate,
      result.report,
    ]);

    querySpy.mockRestore();
  });
});
