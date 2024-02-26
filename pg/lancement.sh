#! /bin/sh
 
env | grep "PG"

echo "01-init : "
psql -d $POSTGRES_DB -f /scripts/01-init.sql

echo "Users creation : "
psql -d $POSTGRES_DB -c "CREATE USER \"$PG_VAO_USER\" WITH password '$PG_VAO_PASSWORD'"
psql -d $POSTGRES_DB -c "CREATE USER \"$PG_VAO_DOCUMENT_USER\" WITH password '$PG_VAO_DOCUMENT_PASSWORD'"

echo '02-1-geo-init : '
psql -d $POSTGRES_DB -f /scripts/02/02-1-geo-init.sql
echo '02-2-doc-init : '
psql -d $POSTGRES_DB -f /scripts/02/02-2-doc-init.sql
echo '02-3-back-init : '
psql -d $POSTGRES_DB -f /scripts/02/02-3-back-init.sql
echo '02-4-front-init : '
psql -d $POSTGRES_DB -f /scripts/02/02-4-front-init.sql

echo '03-1-geo-data : '
psql -d $POSTGRES_DB -f /scripts/03/03-1-geo-data.sql
echo '03-2-back-data : '
psql -d $POSTGRES_DB -f /scripts/03/03-2-back-data.sql

echo '04-1-back-user : '
psql -d $POSTGRES_DB -f /scripts/04/04-1-back-user.sql

