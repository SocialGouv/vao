const app = require("./app");
const logger = require("./utils/logger");

const pgpool = require("./pgpool");
const pgpoolDoc = require("./pgpoolDoc");

const log = logger(module.filename);

const server = app.listen(process.env.PORT ?? 3000, () => {
  log.i("Server started !");
});

function shutdown(signal) {
  return async (err) => {
    log.i(`shutdown - Got ${signal} signal`);
    if (err && signal !== err) {
      log.w(`${signal}`, err.stack || err);
      if (err.cause) {
        log.w(`shutdown - ${signal} caused by `, err.cause);
      }
    }

    log.d("shutdown - server closing");
    await new Promise((resolve) => {
      server.close(() => {
        log.d("shutdown - server closed");
        resolve();
      });
    });
    await pgpool.disconnect();
    await pgpoolDoc.disconnect();
    log.d("shutdown - exiting...");
    setTimeout(() => {
      process.exit(err ? 1 : 0);
    }, 1000).unref();
  };
}

process.once("uncaughtException", shutdown("uncaughtException"));
process.once("unhandledRejection", shutdown("unhandledRejection"));

process.once("SIGTERM", shutdown("SIGTERM"));
process.once("SIGINT", shutdown("SIGINT"));
process.once("SIGUSR2", shutdown("SIGUSR2"));
