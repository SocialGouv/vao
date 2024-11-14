const AppError = require("../../utils/error");
const Territoire = require("../../services/Territoire");
const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function update(req, res, next) {
  log.i("IN");
  const { id } = req.params;
  const { territoire, parent } = req.body;
  const { territoireCode } = req.decoded;
  if (!id || !territoire || !parent || !territoireCode) {
    return next(
      new AppError("Paramètre manquant", {
        statusCode: 400,
      }),
    );
  }
  let response;
  if (
    territoireCode === "FRA" ||
    territoireCode === territoire ||
    territoireCode === parent
  ) {
    response = await Territoire.update(id, req.body);
  } else {
    return next(
      new AppError("Bad request unauthorized", {
        statusCode: 401,
      }),
    );
  }
  log.i("DONE");
  return res.json({ response });
};
