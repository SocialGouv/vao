import { pool } from "../db";
import { CronJob } from "cron";
import type { InsertParams, QueryParams } from "./cron.type";
import * as Sentry from "@sentry/node";
import { sentry } from "../config";

const queryInsert = (params: QueryParams): [string, QueryParams] => [
  `
  INSERT INTO back.crons (
    cron_name,
    start_date,
    end_date,
    report
  )
  VALUES (
    $1,
    $2,
    $3,
    $4
  )
  RETURNING *;
  `,
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

export const createCron = (
  duration: string,
  name: string,
  callback: () => Promise<void>,
) => {
  if (sentry.enabled) {
    const CronJobWithCheckIn = Sentry.cron.instrumentCron(CronJob, name);
    return new CronJobWithCheckIn(duration, callback);
  }
  return new CronJob(duration, callback);
};
