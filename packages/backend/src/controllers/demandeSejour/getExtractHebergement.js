const DemandeSejour = require("../../services/DemandeSejour");
const logger = require("../../utils/logger");
const dayjs = require("dayjs");

const log = logger(module.filename);

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
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');
  const departements = req.departements.map((d) => d.value);
  try {
    const result = await DemandeSejour.getHebergementsByDepartementCodes(
      departements,
      {
        limit: 20,
        offset: 0,
        order: "ASC",
        search: "",
        sort: "nom",
      },
    );
    const titles = [
      { key: "nom", label: "Nom de l’hébergement" },
      { key: "dateDebut", label: "Date de début de séjour" },
      { key: "dateFin", label: "Date de fin de séjour" },
      { key: "departement", label: "Département" },
      { key: "adresse", label: "Adresse" },
      { key: "telephone", label: "Téléphone" },
      { key: "dateVisite", label: "Date de visite préalable" },
      { key: "reglementationErp", label: "Réglementation ERP" },
    ];
    const csv = [
      titles.map(({ label }) => label).join(";"),
      ...result.data.hebergements.map((item) => {
        const newItem = { ...item };
        newItem.reglementationErp = newItem.reglementationErp ? "Oui" : "Non";
        newItem.dateDebut = dayjs(newItem.dateDebut).format("DD/MM/YYYY");
        newItem.dateFin = dayjs(newItem.dateFin).format("DD/MM/YYYY");
        newItem.adresse = newItem.adresse.label;
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