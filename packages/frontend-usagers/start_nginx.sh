#!/bin/sh

APP_TEMPLATED_DIR=/app
APP_DIR=/usr/share/nginx/html

cp -r $APP_TEMPLATED_DIR/* $APP_DIR/

ls $APP_TEMPLATED_DIR
echo "==== app"
ls $APP_DIR

env

cat /usr/share/nginx/html/index.html


# List of files to process
FILES=$(find $APP_DIR -type f -name '*.html' -o -name '*.js' -o -name '*.css')

for FILE in $FILES; do
    echo "--subst $FILE"
    envsubst < "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
done

cat /usr/share/nginx/html/index.html

exec nginx -g "daemon off;"