/* eslint-disable no-param-reassign */
const logger = require("../utils/logger");

const log = logger(module.filename);

function checkComingFrom(req, _res, next) {
  log.i("IN");
  req.path.includes("/bo/")
    ? (req.params.origin = "back")
    : (req.params.origin = "front");
  next();
}

module.exports = checkComingFrom;
