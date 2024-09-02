const BoUser = require("../../services/BoUser");
const logger = require("../../utils/logger");

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

module.exports = async function getExtract(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { territoireCode } = decoded ?? {};

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');

  try {
    const result = await BoUser.read({}, territoireCode);

    const titles = [
      { key: "nom", label: "Nom" },
      { key: "prenom", label: "Prenom" },
      { key: "email", label: "Courriel" },
      { key: "territoire", label: "Territoire" },
      { key: "validated", label: "Compte validé" },
      { key: "deleted", label: "Compte actif" },
    ];

    const csv = [
      titles.map(({ label }) => label).join(";"),
      ...result.users.map((item) => {
        const newItem = { ...item };
        newItem.validated = newItem.validated ? "oui" : "non";
        newItem.deleted = newItem.deleted ? "non" : "oui";
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
