module.exports = {
  smtp: {
    pool: process.env.SMTP_IS_POOLED !== "false",
    host: process.env.SMTP_HOST || "localhost",
    port: process.env.SMTP_PORT || 25,
    secure: process.env.SMTP_IS_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  },
};
