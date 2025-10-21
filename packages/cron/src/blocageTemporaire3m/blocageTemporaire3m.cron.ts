import { createCron } from "../cron/cron.service";
import { disableAccount3m } from "../config";
import { blocageTemporaire3mActions } from "./blocageTemporaire3m.service";

export const cronBlocageTemporaire3m = () =>
  createCron(
    disableAccount3m.cron,
    disableAccount3m.name,
    blocageTemporaire3mActions,
  );