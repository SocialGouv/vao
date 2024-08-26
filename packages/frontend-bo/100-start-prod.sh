#!/bin/sh

set -e

READONLY_DIR=/app
WRITABLE_DIR=/usr/share/nginx/html

cp -r $READONLY_DIR/* $WRITABLE_DIR/

cat <<EOF >>$WRITABLE_DIR/config.json
{
    "appVersion": "$ENV_NUXT_PUBLIC_APP_VERSION",
    "backendUrl": "$ENV_NUXT_PUBLIC_BACKEND_URL",
    "environment": "$ENV_NUXT_PUBLIC_ENVIRONMENT",
    "matomo": {
        "enabled": "$ENV_NUXT_PUBLIC_MATOMO_ENABLED",
        "host": "$ENV_NUXT_PUBLIC_MATOMO_HOST",
        "siteId": "$ENV_NUXT_PUBLIC_MATOMO_SITE_ID"
    },
    "sentry": {
        "enabled": "$ENV_NUXT_PUBLIC_SENTRY_ENABLED",
        "dsn": "$ENV_NUXT_PUBLIC_SENTRY_DSN",
        "release": "$ENV_NUXT_PUBLIC_SENTRY_RELEASE"
    }
}
EOF
