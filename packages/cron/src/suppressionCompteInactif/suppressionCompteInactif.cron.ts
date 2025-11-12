import { createCron } from "../cron/cron.service";
import { suppressionCompteInactif } from "../config";
import { suppressionCompteInactifActions } from "./suppressionCompteInactif.service";

export const cronSuppressionCompteInactif = () =>
  createCron(
    suppressionCompteInactif.cron,
    suppressionCompteInactif.name,
    suppressionCompteInactifActions,
  );
