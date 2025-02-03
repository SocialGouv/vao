const dayjs = require("dayjs");

const DemandeSejour = require("../../services/DemandeSejour");
const logger = require("../../utils/logger");

const log = logger(module.filename);

const getSaison = (date) =>
  ["Hiver", "Printemps", "Eté", "Automne"].flatMap((season) =>
    Array(3).fill(season),
  )[new Date(date).getMonth()];

const escapeCsvField = (field) => {
  if (typeof field !== "string") {
    return `${field}`;
  }

  if (field.includes('"') || field.includes(";") || field.includes("\n")) {
    const fieldEscaped = field.replace(/"/g, '""');
    return `"${fieldEscaped}"`;
  }
  return field;
};

module.exports = async function get(req, res, next) {
  log.i("IN");
  const territoireCode = req.decoded.territoireCode;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');

  try {
    const data = await DemandeSejour.getExtract(
      territoireCode,
      req.departements.map((d) => d.value),
    );

    const titles = [
      "reference",
      "libelle",
      "date_debut",
      "date_fin",
      "saison",
      "organisme",
      "responsable_sejour_email",
      "responsable_sejour_telephone",
      "statut",
      "created_at",
      "departement_instruction",
      "region_instruction",
    ];

    const csv = [
      titles.join(";"),
      ...data.map((item) => {
        const newItem = { ...item };
        newItem.organisme =
          item.organisme.typeOrganisme === "personne_morale"
            ? item.organisme.personneMorale.raisonSociale
            : `${item.organisme.personnePhysique.prenom} ${item.organisme.personnePhysique.nomUsage ?? item.organisme.personnePhysique.nomNaissance}`;
        newItem.date_debut = dayjs(item.date_debut).format("YYYY-MM-DD");
        newItem.date_fin = dayjs(item.date_fin).format("YYYY-MM-DD");
        newItem.created_at = dayjs(item.created_at).format("YYYY-MM-DD");
        newItem.saison = getSaison(item.date_debut);
        return [
          ...titles.map((title) => escapeCsvField(newItem[title] ?? "")),
        ].join(";");
      }),
    ].join("\n");

    return res.status(200).send(csv);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
