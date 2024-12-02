const Hebergement = require("../../services/hebergement/Hebergement");
const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("IN");
  const { id: userId } = req.decoded;
  let hebergements;
  let searchByUserId = true;
  try {
    const search = req.query.search ? JSON.parse(req.query.search) : {};
    if (search?.organismeId) {
      const organismeUserConnected = await Organisme.getOne({
        use_id: userId,
      });
      if (organismeUserConnected?.organismeId !== search.organismeId) {
        // Si c'est l'organisme de l'utilisateur connecté on remonte tous les hébergements de cet utilisateur
        searchByUserId = false;
        const organismeSiege = await Organisme.getSiege(
          organismeUserConnected.personneMorale.siret,
        );
        // L'organisme Siege est bien le même organisme que l'utilisateur connecté
        if (
          organismeSiege.organismeId === organismeUserConnected?.organismeId
        ) {
          hebergements = await Hebergement.getBySiren(
            organismeSiege.personneMorale.siren,
          );
        }
      }
    }
    if (searchByUserId) {
      // Si c'est l'oganisme de l'utilisateur connecté on remonte tous les hébergements de cet utilisateur
      hebergements = await Hebergement.getByUserId(userId);
    }
    log.d(hebergements);
    return res.status(200).json({ hebergements });
  } catch (error) {
    log.w("DONE with error");
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération des hebergements",
    });
  }
};
