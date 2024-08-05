const logger = require("../../utils/logger");
const eigService = require("../../services/eig");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  const { declarationId } = req.params;
  // La vérification de la non nullité de eigId est effectuée par le middleware checkPermissionEIG
  log.i("IN", { declarationId });

  try {
    const eigs = await eigService.getByDsId(declarationId);

    return res.status(200).json({ eigs });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
