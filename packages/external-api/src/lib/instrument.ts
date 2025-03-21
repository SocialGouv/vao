import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

import configuration from "../config/configuration";

Sentry.init({
  dsn: configuration().sentry.dsn,
  environment: configuration().sentry.environment,
  ignoreTransactions: [/^GET \/$/],
  includeLocalVariables: true,
  integrations: [
    Sentry.requestDataIntegration({
      include: {
        cookies: false,
        user: {
          email: false,
        },
      },
    }),
    nodeProfilingIntegration(),
  ],
  profilesSampleRate: 1.0,
  release: configuration().sentry.release,
  tracesSampleRate: 1.0,
});
