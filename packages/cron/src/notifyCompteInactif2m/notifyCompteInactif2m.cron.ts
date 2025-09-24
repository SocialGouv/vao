import { createCron } from "../cron/cron.service";
import { notifyCompteInactif2m } from "../config";
import { notifyCompteInactif2mActions } from "./notifyCompteInactif2m.service";

export const cronNotifyCompteInactif2m = () =>
  createCron(
    notifyCompteInactif2m.cron,
    notifyCompteInactif2m.name,
    notifyCompteInactif2mActions,
  );
