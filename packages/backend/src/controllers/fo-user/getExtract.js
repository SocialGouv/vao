const { escapeCsvField } = require("../../utils/csv");
const FoUser = require("../../services/FoUser");
const logger = require("../../utils/logger");
const dayjs = require("dayjs");

const log = logger(module.filename);

module.exports = async function getExtract(req, res, next) {
  log.i("getExtract IN", req);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="data.csv"');

  try {
    const result = await FoUser.read({
      limit: 10000,
      search: { organisme_id: req.params.organismeId },
    });

    const titles = [
      { key: "nom", label: "Nom" },
      { key: "prenom", label: "Prenom" },
      { key: "email", label: "Courriel" },
      { key: "raisonSociale", label: "Raison sociale" },
      { key: "statut", label: "Statut" },
      { key: "dateCreation", label: "Date de création" },
      { key: "lastConnectionAt", label: "Date dernière connexion" },
      { key: "nombreDeclarations", label: "Nombre de déclaration" },
    ];

    const csv = [
      titles.map(({ label }) => label).join(";"),
      ...result.users.map((item) => {
        const newItem = { ...item };
        newItem.statut =
          newItem.statut === "VALIDATED" ? "Validé" : "Non validé";
        newItem.dateCreation = dayjs(newItem.dateCreation).format("DD/MM/YYYY");
        newItem.lastConnectionAt = newItem.lastConnectionAt
          ? dayjs(newItem.lastConnectionAt).format("DD/MM/YYYY")
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
