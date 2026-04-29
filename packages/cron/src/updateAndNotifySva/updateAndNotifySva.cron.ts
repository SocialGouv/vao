import { createCron } from "../cron/cron.service";
import { updateAndNotifySva } from "../config";
import { updateAndNotifySvaActions } from "./updateAndNotifySva.service";

export const cronUpdateAndNotifySva = () =>
  createCron(
    updateAndNotifySva.cron,
    updateAndNotifySva.name,
    updateAndNotifySvaActions,
  );
