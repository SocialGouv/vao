const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");
const AppError = require("../../utils/error");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  try {
    const organisme = await Organisme.get({
      use_id: userId,
    });
    if (!organisme) {
      log.w("Error while getting user's organisme");
      throw new AppError("Organisme non trouvé", {
        name: "NOT_FOUND",
        statusCode: 404,
      });
    }
    const organismesId = [];
    if (organisme.personneMorale?.porteurAgrement) {
      const organismes = await Organisme.getBySiren(
        organisme.personneMorale.siren,
      );
      organismesId.push(organismes.map((o) => o.organismeId));
    } else {
      organismesId.push(organisme.organismeId);
    }
    const demandes = await DemandeSejour.get(organismesId);
    log.d(demandes);
    return res.status(200).json({ demandes });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
