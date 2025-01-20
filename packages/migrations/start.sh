#!/bin/bash

yarn workspace @vao/migrations install
exec tail -f /dev/null
# exec yarn workspace @vao/migrations run knex --cwd ./src migrate:latest
