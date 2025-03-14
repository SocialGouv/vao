import * as Sentry from "@sentry/node";
import { sentry } from "../config";

if (sentry.enabled) {
  Sentry.init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    release: sentry.release,
  });
}
