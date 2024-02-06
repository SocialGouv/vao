const nodemailer = require("nodemailer");
const { AppError } = require("./error");

const { smtp: smtpConfig } = require("../config");

const logger = require("./logger");

const log = logger(module.filename);

let transporterPool;

function getTransporter() {
  if (transporterPool) {
    return transporterPool;
  }

  const smtpSettings = { ...smtpConfig };

  if (smtpConfig.auth.user === undefined) {
    delete smtpSettings.auth;
  }

  log.d("getTransporter - createTransport", { smtpSettings });

  transporterPool = nodemailer.createTransport(smtpSettings);
  return transporterPool;
}

async function verifyConnection() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
  } catch (error) {
    log.w("verifyConnection", error.message);
    throw new AppError("erreur lors de la connexion", {
      name: "mailserver-connection-failed",
      cause: error,
    });
  }
}

module.exports = {
  verifyConnection,
  getTransporter,
};
