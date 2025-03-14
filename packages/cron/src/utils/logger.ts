import pino from "pino";

export const logger = pino({
  name: "vao-cron",
  level: process.env.LOG_LEVEL || "info",
});
