const jwt = require("jsonwebtoken");

const config = require("../../config");

const ApiToken = require("../../services/ApiToken");

module.exports = async (req, res, next) => {
  const { decoded } = req;

  const { id: userId } = decoded;

  const expiresAt = new Date(new Date().getTime() + config.apiToken.expiresIn);

  const apiToken = jwt.sign({ userId }, config.apiToken.tokenSecret, {
    algorithm: config.algorithm,
    expiresIn: config.apiToken.expiresIn / 1000,
  });

  try {
    const result = await ApiToken.createOrUpdateApiToken({
      apiToken,
      expiresAt,
      userId,
    });
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
