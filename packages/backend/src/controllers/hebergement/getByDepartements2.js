const Hebergement = require("../../services/hebergement/Hebergement");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function list(req, res, next) {
  log.i("IN");
  const departements = req.departements.map((d) => d.value);
  try {
    const result = await Hebergement.getByDepartementCodes2(
      req.query,
      departements,
    );
    log.d(result);
    return res.status(200).json(result);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
