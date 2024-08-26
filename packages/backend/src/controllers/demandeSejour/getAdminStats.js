const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const departements = req.departements.map((d) => d.value);
  const territoireCode = req.decoded.territoireCode;

  try {
    const stats = await DemandeSejour.getAdminStats(
      departements,
      territoireCode,
    );
    return res.status(200).json({ stats });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
