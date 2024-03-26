const yup = require("yup");

const Hebergement = require("../../services/Hebergement");
const logger = require("../../utils/logger");
const HebergementSchema = require("../../schemas/hebergement");

const log = logger(module.filename);

module.exports = async function post(req, res) {
  const hebergementId = req.params.id;
  const { nom, coordonnees, informationsLocaux, informationsTransport } =
    req.body;
  log.i("IN", {
    coordonnees,
    hebergementId,
    informationsLocaux,
    informationsTransport,
    nom,
  });

  if (
    !nom ||
    !coordonnees ||
    !informationsLocaux ||
    !informationsTransport ||
    !hebergementId
  ) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }

  const hebergement = await yup.object(HebergementSchema.schema).validate(
    {
      coordonnees,
      informationsLocaux,
      informationsTransport,
      nom,
    },
    {
      stripped: true,
    },
  );

  try {
    await Hebergement.update(hebergementId, hebergement);
    log.i("DONE");
    return res.sendStatus(200);
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      messagee: "Une erreur est survenue durant l'ajout de l'hébergement",
    });
  }
};
