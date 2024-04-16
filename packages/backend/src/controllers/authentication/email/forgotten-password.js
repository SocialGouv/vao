const jwt = require("jsonwebtoken");
const config = require("../../../config");

const User = require("../../../services/User");
const Send = require("../../../services/mail").mailService.send;

const logger = require("../../../utils/logger");
const normalize = require("../../../utils/normalize");
const MailUtils = require("../../../utils/mail");
const { buildEmailToken } = require("../../../utils/token");

const log = logger(module.filename);

module.exports = async function login(req, res) {
  const { email } = req.body;
  log.i("In", { email });
  if (!email) {
    log.w("email manquant");
    return res.status(400).json({ message: "Paramète manquant" });
  }

  const users = await User.read({ mail: normalize(email) });

  if (users.length === 0) {
    log.w("Utilisateur inexistant");
    return res.json({ message: "Mail envoyé" });
  }
  const [user] = users;

  log.d({ user });

  try {
    console.info(config.tokenSecret);
    const token = jwt.sign(buildEmailToken(email), config.tokenSecret, {
      algorithm: "ES512",
      expiresIn: config.resetPasswordToken.expiresIn / 1000,
    });
    await Send(
      MailUtils.usagers.authentication.sendForgottenPassword({
        email,
        token,
      }),
    );

    log.i("DONE");

    return res.json({ message: "Mail envoyé" });
  } catch (error) {
    log.w(error);
    return res.status(500).json({ name: "DefaultError" });
  }
};
