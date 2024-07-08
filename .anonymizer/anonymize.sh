#!/usr/bin/env bash

set -e

exclude_tables="back.sessions,front.sessions"

cd "$(dirname "$0")"

source .env
pg_dump_directory=/tmp/pg_dump
mkdir -p $pg_dump_directory

greenmask -v || (echo "You need to download greenmask from https://github.com/GreenmaskIO/greenmask/releases/tag/v0.1.14 in $directory" && exit)

cat config.yaml \
    | sed "s%{{tmp}}%$pg_dump_directory%" \
    > config.local.yaml


greenmask dump --config config.local.yaml --log-level debug -j 10 --exclude-table-data $exclude_tables
# docker run --network host --rm -v $(pwd):/workspace -w /workspace ghcr.io/socialgouv/docker/greenmask:1.1.3 \
#     mkdir -p $pg_dump_directory \
#     && greenmask dump --config config.local.yaml --log-level debug -j 10 --exclude-table-data $exclude_tables

export PGDATABASE=${PGDATABASE_RESTORE:-$PGDATABASE_anonymized}
pg_restore --clean --if-exists --no-owner --no-acl --verbose -d $PGDATABASE $pg_dump_directory/$(ls $pg_dump_directory | tail -n 1)
