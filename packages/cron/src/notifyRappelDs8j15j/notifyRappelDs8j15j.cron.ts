import { createCron } from "../cron/cron.service";
import { notifyDs8jDs15 } from "../config";
import { notifyRappelDeclarationSejourActions } from "./notifyRappelDs8j15j.service";

export const cronNotifyRappelDs8j15j = () =>
  createCron(
    notifyDs8jDs15.cron,
    notifyDs8jDs15.name,
    notifyRappelDeclarationSejourActions,
  );
