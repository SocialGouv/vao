const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("IN");
  const departements = req.departements.map((d) => d.value);

  const { sejourId, hebergementId } = req.params;

  if ([sejourId, hebergementId].includes(undefined)) {
    return res.status(400).json({
      message: "Invalide requête",
    });
  }

  try {
    const response = await DemandeSejour.getHebergement(
      sejourId,
      departements,
      hebergementId,
    );
    if (!response.length) {
      return res.status(404).json({
        message: "L'hébergement n'a pas été trouvé",
      });
    }
    return res.status(200).json({ ...response[0] });
  } catch (error) {
    log.w("DONE with error");
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération des hebergements",
    });
  }
};
