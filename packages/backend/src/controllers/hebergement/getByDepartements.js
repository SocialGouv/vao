const Hebergement = require("../../services/Hebergement");

const logger = require("../../utils/logger");
const Sentry = require("@sentry/node");

const log = logger(module.filename);

async function getByDepartements(req, res) {
  log.i("IN");
  const departements = req.departements.map((d) => d.value);
  const { limit = 20, offset = 0, search = "", sort = "nom" } = req.query;
  const titleWithoutOrdering = sort.includes("-") ? sort.substring(1) : sort;

  const titles = [
    "departement",
    "nom",
    "email",
    "telephone",
    "nomGestionnaire",
    "dateVisite",
    "reglementationErp",
  ];

  const titleSorted = titles.find((t) => t === titleWithoutOrdering)
    ? titleWithoutOrdering
    : "nom";

  try {
    const { data } = await Hebergement.getByDepartementCodes(departements, {
      limit,
      offset,
      order:
        titleSorted === titleWithoutOrdering && sort.includes("-")
          ? "DESC"
          : "ASC",
      search,
      sort: titleSorted ?? "nom",
    });
    return res.status(200).json({
      count: data.total_count,
      hebergements: data.hebergements || [],
      limit,
      offset,
    });
  } catch (error) {
    log.w("DONE with error");
    return res.status(400).json({
      message:
        "une erreur est survenue durant la récupération des hebergements",
    });
  }
}

module.exports = async function get(req, res) {
  // create new Sentry trace manually to enable profiler for its nested span
  return await Sentry.startNewTrace(async () => {
    return await Sentry.startSpan(
      {
        name: `Profile ${req.method} ${req.baseUrl}/${req.path}`,
        op: "http",
      },
      async () => {
        return await getByDepartements(req, res);
      },
    );
  });
};
