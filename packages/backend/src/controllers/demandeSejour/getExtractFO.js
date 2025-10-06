const DemandeSejour = require("../../services/DemandeSejour");
const Organisme = require("../../services/Organisme");

const { escapeCsvField } = require("../../utils/csv");
const dayjs = require("dayjs");
const logger = require("../../utils/logger");
const AppError = require("../../utils/error");
const { formatSiret } = require("../../utils/siret");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  try {
    const organisme = await Organisme.getOne({
      use_id: userId,
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');

    let organismesId;
    if (organisme.personneMorale?.porteurAgrement) {
      const organismes = await Organisme.getBySiren(
        organisme.personneMorale.siren,
      );
      organismesId = organismes.map((o) => o.organismeId);
    } else {
      organismesId = [organisme.organismeId];
    }
    if (!organismesId) {
      log.w("Organisme non trouvé pour cet utilisateur");

      return next(
        new AppError("Organisme non trouvé pour cet utilisateur", {
          statusCode: 400,
        }),
      );
    }
    const data = await DemandeSejour.getExtractFO(organismesId);
    const titles = [
      "reference",
      "libelle",
      "departement",
      "etablissement",
      "siret",
      "date_debut",
      "date_fin",
      "statut",
      "hebergement_nom",
    ];
    const csv = [
      titles.join(";"),
      ...data.map((item) => {
        const newItem = { ...item };
        newItem.date_debut = dayjs(item.date_debut).format("DD/MM/YYYY");
        newItem.date_fin = dayjs(item.date_fin).format("DD/MM/YYYY");
        newItem.siret = newItem?.siret
          ? formatSiret({ siret: newItem.siret })
          : "";
        newItem.etablissement =
          item.type_organisme === "personne_morale" ? item.raison_sociale : "";
        return [
          ...titles.map((title) => escapeCsvField(newItem[title] ?? "")),
        ].join(";");
      }),
    ].join("\n");

    log.d(csv);
    return res.status(200).send(csv);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
