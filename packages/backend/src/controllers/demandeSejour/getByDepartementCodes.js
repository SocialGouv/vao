const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getByDepartementCodes(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: adminId } = decoded ?? {};
  log.d("userId", { adminId });

  try {
    const { limit, offset, sortBy, sortDirection, search } = req.query;

    const demandesWithPagination = await DemandeSejour.getByDepartementCodes(
      {
        limit,
        offset,
        search: JSON.parse(search ?? "{}"),
        sortBy,
        sortDirection,
      },
      req.departements.map((d) => d.value),
    );
    log.d(demandesWithPagination);
    return res.status(200).json({ demandesWithPagination });
  } catch (error) {
    return next(error);
  }
};
