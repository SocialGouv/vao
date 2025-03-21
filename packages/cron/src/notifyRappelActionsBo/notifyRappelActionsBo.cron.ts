import { createCron } from "../cron/cron.service";
import { notifyRequestActionsBo } from "../config";
import { notifyRappelActions } from "./notifyRappelActionsBo.service";

export const cronNotifyRappelActionsBo = () =>
  createCron(
    notifyRequestActionsBo.cron,
    notifyRequestActionsBo.name,
    notifyRappelActions,
  );
