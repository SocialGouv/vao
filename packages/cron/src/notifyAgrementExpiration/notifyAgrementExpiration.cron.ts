import { createCron } from "../cron/cron.service";
import { notifyAgrementExpiration } from "../config";
import { notifyAgrementExpirationActions } from "./notifyAgrementExpiration.service";

export const cronNotifyAgrementExpiration = () =>
  createCron(
    notifyAgrementExpiration.cron,
    notifyAgrementExpiration.name,
    notifyAgrementExpirationActions,
  );
