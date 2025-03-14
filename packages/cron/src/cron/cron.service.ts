import { pool } from "../db";
import type { InsertParams, QueryParams } from "./cron.type";

const queryInsert = (params: QueryParams): [string, QueryParams] => [
  `
  INSERT INTO back.crons (
    cron_name,
    start_date,
    end_date,
    report,
  )
  VALUES (
    $1
    $2
    $3
    $4
  )`,
  params,
];

export const insertCron = async (params: InsertParams) => {
  await pool.query(
    ...queryInsert([
      params.cronName,
      params.startDate,
      params.endDate,
      params.report,
    ]),
  );
};
