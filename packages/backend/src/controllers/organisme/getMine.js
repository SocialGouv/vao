const Organisme = require("../../services/Organisme");
const Agrement = require("../../services/Agrement");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  try {
    const organisme = await Organisme.get({
      use_id: userId,
    });
    if (
      organisme &&
      organisme.typeOrganisme === "personne_morale" &&
      !organisme.personneMorale.porteurAgrement
    ) {
      // surcharge de l'objet agrement par celui de l'organisme agree
      log.d("recuperation agrement");
      const siretAgree = organisme.personneMorale.etablissementPrincipal.siret;
      const agrement = await Agrement.getBySiret(siretAgree);
      organisme.agrement = agrement;
    }
    return res.status(200).json({ organisme });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
