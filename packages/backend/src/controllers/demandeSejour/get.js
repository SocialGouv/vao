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
    const listeOrganismeId = [];
    if (organisme.personneMorale?.porteurAgrement) {
      const listeOrganisme = await Organisme.getBySiren(
        organisme.personneMorale.siren,
      );
      listeOrganismeId.push(listeOrganisme.map((o) => o.organismeId));
    } else {
      listeOrganismeId.push(organisme.organismeId);
    }
    const demandes = await DemandeSejour.get(listeOrganismeId);
    log.d(demandes);
    return res.status(200).json({ demandes });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
