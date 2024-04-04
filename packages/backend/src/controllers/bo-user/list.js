const BoUser = require("../../services/BoUser");
// const Session = require("../../services/Session");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getList(req, res) {
  log.i("In");
  const { decoded } = req;
  const { id: adminId } = decoded ?? {};
  log.d("userId", { adminId });

  try {
    const { limit, offset, sortBy, sortDirection, search } = req.query;
    log.d({ search });
    const result = await BoUser.read({
      limit,
      offset,
      search: JSON.parse(search ?? "{}"),
      sortBy,
      sortDirection,
    });
    log.d({ result });
    return res.status(200).json(result);
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération de la liste des utilisateurs BO",
    });
  }
};
