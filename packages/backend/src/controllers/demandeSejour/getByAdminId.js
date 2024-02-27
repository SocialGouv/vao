const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getByAdminId(req, res) {
  log.i("In");
  const { decoded } = req;
  //  TODO : check what the jwt contains. Here i suppose that the id the the admin id
  const { id: adminId } = decoded ?? {};
  log.d("userId", { adminId });

  try {
    const { limit, offset, sortBy, sortDirection, search } = req.query;

    const demandesWithPagination = await DemandeSejour.getByAdminId(adminId, {
      limit,
      offset,
      search: JSON.parse(search ?? "{}"),
      sortBy,
      sortDirection,
    });
    log.d(demandesWithPagination);
    return res.status(200).json({ demandesWithPagination });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération des demandes de séjour",
    });
  }
};
