const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  try {
    const organisme = await Organisme.getOne({
      use_id: userId,
    });
    let organismesId;
    if (organisme.personneMorale?.porteurAgrement) {
      const organismes = await Organisme.getBySiren(
        organisme.personneMorale.siren,
      );
      organismesId = organismes.map((o) => o.organismeId);
    } else {
      organismesId = [organisme.organismeId];
    }
    const demandes = await DemandeSejour.get(organismesId, req.query);
    log.d(demandes);
    return res.status(200).json({
      demandes: demandes.rows,
      total: demandes.total,
    });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
