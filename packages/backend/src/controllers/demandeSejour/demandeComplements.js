const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");
const { statuts } = require("../../helpers/ds-statuts");
const MailUtils = require("../../utils/mail");

const Send = require("../../services/mail").mailService.send;

const log = logger(module.filename);

module.exports = async function post(req, res) {
  const declarationId = req.params.declarationId;
  const { id: userId } = req.decoded;
  const { commentaire } = req.body;
  log.i("IN", { declarationId }, req.body);

  if (!declarationId) {
    log.w("missing parameter");
    return res.status(400).json({ message: "paramètre manquant." });
  }

  const declaration = await DemandeSejour.getOne({ "ds.id": declarationId });

  if (!declaration) {
    log.w("error while getting current declaration");
    return res.status(400).json({
      message:
        "Une erreur est survenue durant la transmission de la declaration",
    });
  }

  if (
    !req.departements.map((d) => d.value).includes(declaration.departementSuivi)
  ) {
    log.w("Administrator is not principal instructor");
    return res.status(403).json({
      message: "L'administrateur n'est pas instructeur principal de la demande",
    });
  }

  if (declaration.statut !== statuts.EN_COURS) {
    log.w("Delaration should be in statut EN COURS");
    return res.status(400).json({
      message: "Statut non compatible",
    });
  }

  try {
    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );

    await DemandeSejour.updateStatut(
      declarationId,
      statuts.A_MODIFIER,
      {
        boUserId: userId,
        declarationId,
        metaData: { commentaire },
        source: "DDETS",
        type: "declaration_sejour",
        typePrecision: "Demande de complémements",
        userId: null,
      },
      () =>
        Send(
          MailUtils.usagers.declarationSejour.sendACompleterMail({
            comment: commentaire,
            declaration,
            destinataires,
          }),
        ),
    );

    return res.status(200).end();
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "Une erreur est survenue durant la mise à jour de la demande",
    });
  }
};
