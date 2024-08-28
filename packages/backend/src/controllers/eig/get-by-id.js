const logger = require("../../utils/logger");
const eigService = require("../../services/eig");
const { getEmails } = require("../../helpers/eigMail");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  const { id: eigId } = req.params;
  // La vérification de la non nullité de eigId est effectuée par le middleware checkPermissionEIG
  log.i("IN", { eigId });

  try {
    const eig = await eigService.getById({
      eigId,
    });

    const { emailsDDETS, emailsDREETS, emailsOrganisateur } = await getEmails(
      eig.departement,
      eig.userId,
    );
    Object.assign(eig, { emailsDDETS, emailsDREETS, emailsOrganisateur });

    return res.status(200).json({ eig });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
