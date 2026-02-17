const Sentry = require("@sentry/node");
const logger = require("../../utils/logger");
const AppError = require("../../utils/error").default;
const { getTransporter } = require("./transporter");

const mailSchema = require("./schema");

const log = logger(module.filename);

module.exports.mailService = {
  send: async (payload) => {
    await Sentry.startSpan({ name: "services.mail.send" }, async () => {
      await doSend(payload);
    });
  },
};

async function doSend(payload) {
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
  } catch (error) {
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
  } catch (error) {
    log.w(error.message);
    throw new AppError("An unexpected error happens !", {
      cause: error,
      statusCode: 500,
    });
  }

  log.i("send - DONE");
}
