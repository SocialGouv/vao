const Hebergement = require("../../services/hebergement/Hebergement");

module.exports = async function list(req, res, next) {
  const departements = req.departements.map((d) => d.value);
  try {
    const result = await Hebergement.getByDepartementCodes(
      req.query,
      departements,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
