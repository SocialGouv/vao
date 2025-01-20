const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  try {
    const organismes = await Organisme.getliste(req.query);
    log.d(organismes);
    return res.status(200).json(organismes);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
