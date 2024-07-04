#!/usr/bin/env bash

set -e

exclude_tables="contact_support,contact_support_message,expired_token,message_email,monitor_batch_process,user_usager_login"

mkdir -p /tmp/pg_dump

cd /workspace/.anonymizer

cat config.yaml \
    | sed "s%{{tmp}}%/tmp/pg_dump%" \
    > config.local.yaml

yarn
yarn build

greenmask dump --config config.local.yaml -j 1 --exclude-table-data $exclude_tables
