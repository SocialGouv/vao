import * as Sentry from "@sentry/node";

import AppError from "../../utils/error";
import { logger } from "../../utils/logger";
import { mailSchema } from "./schema";
import { getTransporter } from "./transporter";

const log = logger(module.filename);

export const mailService = {
  send: async (payload: any) => {
    await Sentry.startSpan({ name: "services.mail.send" }, async () => {
      await doSend(payload);
    });
  },
};

async function doSend(payload: any) {
  log.i("send - IN", { payload });

  const mail = { ...payload };

  if (typeof mail.to === "string") {
    mail.to = [mail.to];
  }

  if (typeof mail.cc === "string") {
    mail.cc = [mail.cc];
  }

  try {
    await mailSchema.validate(mail, {
      stripUnknown: true,
    });
  } catch (error: any) {
    log.w(error.name, error.errors.join(", "));
    throw new AppError(error.errors.join(", "), {
      cause: error,
      name: "ValidationError",
      statusCode: 423,
    });
  }

  if ([...(mail.to ?? []), ...(mail.cc ?? [])].length === 0) {
    throw new AppError("At least one element in to or cc is expected", {
      name: "ValidationError",
      statusCode: 423,
    });
  }
  const transporter = getTransporter();

  try {
    await transporter.sendMail(mail);
  } catch (error: any) {
    log.w(error.message);
    throw new AppError("An unexpected error happens !", {
      cause: error,
      statusCode: 500,
    });
  }

  log.i("send - DONE");
}
