import "./utils/instrument";
import { pool } from "./db";
import { cronNotifyCompteInactif2m } from "./notifyCompteInactif2m/notifyCompteInactif2m.cron";
import { cronNotifySuppressionCompteInactif } from "./notifySuppressionCompteInactif/notifySuppressionCompteInactif.cron";
import { cronNotifyRappelActionsBo } from "./notifyRappelActionsBo/notifyRappelActionsBo.cron";
import { cronNotifyRappelDs8j15j } from "./notifyRappelDs8j15j/notifyRappelDs8j15j.cron";
import { cronUpdateStatusDs } from "./updateStatutDs/updateStatusDs.cron";
import { cronBlocageTemporaire3m } from "./blocageTemporaire3m/blocageTemporaire3m.cron";
import { cronSuppressionCompteInactif } from "./suppressionCompteInactif/suppressionCompteInactif.cron";
import { cronNotifyAgrementExpiration } from "./notifyAgrementExpiration/notifyAgrementExpiration.cron";
import { logger } from "./utils/logger";

const startCrons = () => {
  logger.info("Starting crons");
  logger.info("cronNotifyCompteInactif2m");
  cronNotifyCompteInactif2m().start();
  cronNotifySuppressionCompteInactif().start();
  cronNotifyRappelActionsBo().start();
  cronNotifyRappelDs8j15j().start();
  cronUpdateStatusDs().start();
  cronBlocageTemporaire3m().start();
  cronSuppressionCompteInactif().start();
  cronNotifyAgrementExpiration().start();
};

const stopCrons = () => {
  logger.info("Stopping crons");
  cronNotifyCompteInactif2m().stop();
  cronNotifySuppressionCompteInactif().stop();
  cronNotifyRappelActionsBo().stop();
  cronNotifyRappelDs8j15j().stop();
  cronUpdateStatusDs().stop();
  cronBlocageTemporaire3m().stop();
  cronSuppressionCompteInactif().stop();
  cronNotifyAgrementExpiration().stop();
};

startCrons();

const shutdown = async () => {
  stopCrons();
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
