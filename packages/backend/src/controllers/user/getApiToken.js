const ApiToken = require("../../services/ApiToken");

module.exports = async (req, res, next) => {
  const { decoded } = req;

  const { id: userId } = decoded;

  try {
    const result = await ApiToken.getApiToken(userId);
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};
