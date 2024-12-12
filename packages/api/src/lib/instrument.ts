import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

import { sentry } from "../config";

Sentry.init({
  dsn: sentry.dsn,
  environment: sentry.environment,
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
  release: sentry.release,
  tracesSampleRate: 1.0,
});
