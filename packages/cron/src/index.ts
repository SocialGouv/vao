import "./utils/instrument";
import { pool } from "./db";
import { cronNotifyRappelActionsBo } from "./notifyRappelActionsBo/notifyRappelActionsBo.cron";
import { cronNotifyRappelDs8j15j } from "./notifyRappelDs8j15j/notifyRappelDs8j15j.cron";
import { cronUpdateStatusDs } from "./updateStatutDs/updateStatusDs.cron";
import { logger } from "./utils/logger";

const startCrons = () => {
  logger.info("Starting crons");
  cronNotifyRappelActionsBo().start();
  cronNotifyRappelDs8j15j().start();
  cronUpdateStatusDs().start();
};

const stopCrons = () => {
  logger.info("Stopping crons");
  cronNotifyRappelActionsBo().stop();
  cronNotifyRappelDs8j15j().stop();
  cronUpdateStatusDs().stop();
};

startCrons();

const shutdown = async () => {
  stopCrons();
  await pool.end();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
