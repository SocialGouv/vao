const logger = require("../../utils/logger");
const eigService = require("../../services/eig");
const Organisme = require("../../services/Organisme");

const log = logger(module.filename);

module.exports = async function getAvailableDs(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  let organismesId;

  try {
    const organisme = await Organisme.getOne({
      use_id: userId,
    });
    if (organisme.personneMorale?.porteurAgrement) {
      const organismes = await Organisme.getBySiren(
        organisme.personneMorale.siren,
      );
      organismesId = organismes.map((o) => o.organismeId);
    } else {
      organismesId = [organisme.organismeId];
    }
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }

  const { search } = req.query;

  if (!search || search === "") {
    return res.status(200).json([]);
  }

  try {
    const ds = await eigService.getAvailableDs(organismesId, search);
    return res.status(200).json(ds);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  } finally {
    log.i("OUT");
  }
};
