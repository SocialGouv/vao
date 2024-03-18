const BoUser = require("../../services/BoUser");
// const Session = require("../../services/Session");

const logger = require("../../utils/logger");
const normalize = require("../../utils/normalize");

const log = logger(module.filename);

module.exports = async function getList(req, res) {
  log.i("In");
  const { decoded } = req;
  //  TODO : check what the jwt contains. Here i suppose that the id the the admin id
  const { id: adminId } = decoded ?? {};
  log.d("userId", { adminId });

  try {
    const { limit, offset, sortBy, sortDirection, search } = req.query;

    const usersWithPagination = await BoUser.getList(adminId, {
      limit,
      offset,
      search: JSON.parse(search ?? "{}"),
      sortBy,
      sortDirection,
    });
    log.d(usersWithPagination);
    return res.status(200).json({ usersWithPagination });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération de la liste des utilisateurs BO",
    });
  }
};