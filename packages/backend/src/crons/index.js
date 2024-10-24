const logger = require("../utils/logger");

const log = logger(module.filename);

const {
  notifyRappelActionsBO: UsagerNotifyActionsBO,
} = require("./demandes-sejours");
const { notifyRappelds8j15j: UsagerNotify } = require("./demandes-sejours");
const { updateStatutDS: UpdateStatut } = require("./demandes-sejours");

module.exports.stop = function stop() {
  log.i("Stopping crons...");

  UsagerNotifyActionsBO.stop();
  UsagerNotify.stop();
  UpdateStatut.stop();

  log.i("Crons stopped...");
};

module.exports.start = function start() {
  log.i("Starting crons...");

  UsagerNotifyActionsBO.start();
  UsagerNotify.start();
  UpdateStatut.start();

  log.i("Crons started...");
};
