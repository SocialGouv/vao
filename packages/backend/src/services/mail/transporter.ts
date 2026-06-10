import { createTransport, Transporter } from "nodemailer";

import { config } from "../../config";
import AppError from "../../utils/error";
import { logger } from "../../utils/logger";

const log = logger(module.filename);

let transporterPool: Transporter | null = null;

export function getTransporter() {
  if (transporterPool) {
    return transporterPool;
  }

  const smtpSettings = { ...config.smtp };

  if (config.smtp.auth.user === undefined) {
    // @ts-ignore
    delete smtpSettings.auth;
  }

  log.d("getTransporter - createTransport", { smtpSettings });

  transporterPool = createTransport(smtpSettings);
  return transporterPool;
}

export async function verifyConnection() {
  try {
    const transporter = getTransporter();
    await transporter.verify();
  } catch (error: any) {
    log.w("verifyConnection", error.message);
    throw new AppError("erreur lors de la connexion", {
      cause: error,
      name: "mailserver-connection-failed",
    });
  }
}
