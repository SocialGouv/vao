import { createCron } from "../cron/cron.service";
import { updateStatusDs } from "../config";
import { updateStatusDsAction } from "./updateStatusDs.service";

export const cronUpdateStatusDs = () =>
  createCron(updateStatusDs.cron, updateStatusDs.name, updateStatusDsAction);
