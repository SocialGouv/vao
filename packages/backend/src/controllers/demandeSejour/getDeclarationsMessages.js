const DemandeSejour = require("../../services/DemandeSejour");
const Sentry = require("@sentry/node");

async function getDeclarationsMessages(req, res, next) {
  const departements = req.departements.map((d) => d.value);
  const { territoireCode } = req.decoded;
  try {
    const result = await DemandeSejour.getDeclarationsMessages(
      req.query,
      departements,
      territoireCode,
    );
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = async function get(req, res, next) {
  // create new Sentry trace manually to enable profiler for its nested span
  Sentry.startNewTrace(async () => {
    Sentry.startSpan(
      {
        name: `Profile ${req.method} ${req.baseUrl}${req.path}`,
        op: "http",
      },
      async () => {
        await getDeclarationsMessages(req, res, next);
      },
    );
  });
};
