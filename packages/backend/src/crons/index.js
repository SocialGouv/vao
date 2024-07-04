const logger = require("../utils/logger");

const log = logger(module.filename);

const { notifyRappelds8j15j: UsagerNotify } = require("./demandes-sejours");

module.exports.stop = function stop() {
  log.i("Stopping crons...");

  UsagerNotify.stop();

  log.i("Crons stopped...");
};

module.exports.start = function start() {
  log.i("Starting crons...");
  UsagerNotify.start();

  log.i("Crons started...");
};
