const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function getById(req, res) {
  log.i("In");
  const demandeId = req.params.id;

  try {
    const demande = await DemandeSejour.getById(
      demandeId,
      req.departements.map((d) => d.value),
    );
    log.d(demande);
    return res.status(200).json({ demande });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération de la demande de séjour",
    });
  }
};
