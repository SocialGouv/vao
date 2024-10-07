#!/bin/bash

yarn workspace @vao/migrations install
exec yarn workspace @vao/migrations run knex --cwd ./src migrate:latest
