const DemandeSejour = require("../../services/DemandeSejour");
const { escapeCsvField } = require("../../utils/csv");
const logger = require("../../utils/logger");
const dayjs = require("dayjs");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
  const departements = req.departements.map((d) => d.value);
  try {
    const result = await DemandeSejour.getHebergementsByDepartementCode(
      {
        limit: -1,
        order: "ASC",
        search: "",
        sort: "nom",
      },
      departements,
    );
    const titles = [
      { key: "nom", label: "Nom de l’hébergement" },
      { key: "dateDebut", label: "Date de début de séjour" },
      { key: "dateFin", label: "Date de fin de séjour" },
      { key: "departement", label: "Département" },
      { key: "adresse", label: "Adresse" },
      { key: "telephone", label: "Téléphone" },
      { key: "email", label: "Adresse courriel" },
      { key: "dateVisite", label: "Date de visite préalable" },
      { key: "reglementationErp", label: "Réglementation ERP" },
    ];
    const csv = [
      titles.map(({ label }) => label).join(";"),
      ...result.rows.map((item) => {
        const newItem = { ...item };
        newItem.reglementationErp = newItem.reglementationErp ? "Oui" : "Non";
        newItem.dateDebut = dayjs(newItem.dateDebut).format("DD/MM/YYYY");
        newItem.dateFin = dayjs(newItem.dateFin).format("DD/MM/YYYY");
        newItem.dateVisite = newItem.dateVisite
          ? dayjs(newItem.dateVisite).format("DD/MM/YYYY")
          : "";
        return [
          ...titles.map(({ key }) => escapeCsvField(newItem[key] ?? "")),
        ].join(";");
      }),
    ].join("\n");

    return res.status(200).send(csv);
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
