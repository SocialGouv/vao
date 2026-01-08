const Hebergement = require("../../services/hebergement/Hebergement");
const Organisme = require("../../services/Organisme");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("IN");
  const { id: userId } = req.decoded;
  const search = req.query.search ? JSON.parse(req.query.search) : {};
  let hebergements;
  try {
    const organismeUserConnected = await Organisme.getOne({
      use_id: userId,
    });
    const searchByUserId =
      !search?.organismeId ||
      organismeUserConnected?.organismeId === search.organismeId;
    console.log("searchByUserId:", searchByUserId);
    if (!searchByUserId) {
      const organismeSiege = await Organisme.getSiege(
        organismeUserConnected.personneMorale.siret,
      );
      // L'organisme Siege est bien le même organisme que l'utilisateur connecté
      if (organismeSiege.organismeId === organismeUserConnected?.organismeId) {
        hebergements = await Hebergement.getBySiren(
          organismeSiege.personneMorale.siren,
          search,
        );
      }
      return res.status(200).json({ hebergements });
    }
    if (searchByUserId) {
      // Si c'est l'oganisme de l'utilisateur connecté on remonte tous les hébergements de cet utilisateur
      hebergements = await Hebergement.getByUserId(userId, req.query);
      return res.status(200).json(hebergements);
    }
    log.d(hebergements);
  } catch (error) {
    log.w("DONE with error");
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération des hebergements",
    });
  }
};
