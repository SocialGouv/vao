const { initializeWebServer } = require("./app");
const { verifyConnection } = require("./utils/transporter");

const logger = require("./utils/logger");

const log = logger(module.filename);

async function start() {
  log.i("start - IN");
  await verifyConnection();
  await initializeWebServer();
  log.i("start - DONE");
}

start()
  .then(() => {
    log.i("The app has started successfully");
  })
  .catch((error) => {
    log.w("App occured during startup", error);
  });
