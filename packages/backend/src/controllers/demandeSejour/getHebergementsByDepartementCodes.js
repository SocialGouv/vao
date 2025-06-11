const DemandeSejour = require("../../services/DemandeSejour");

module.exports = async function get(req, res, next) {
  const departements = req.departements.map((d) => d.value);
  try {
    const result = await DemandeSejour.getHebergementsByDepartementCode(
      req.query,
      departements,
    );

    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
