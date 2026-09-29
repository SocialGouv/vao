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
echo '02-5-ref-init : '
psql -d $POSTGRES_DB -f /scripts/02/02-5-ref-init.sql

echo "Grants : "
psql -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 <<SQL
GRANT USAGE ON SCHEMA geo TO "${PG_VAO_USER}";
GRANT SELECT ON ALL TABLES IN SCHEMA geo TO "${PG_VAO_USER}";
GRANT ALL ON ALL SEQUENCES IN SCHEMA geo TO "${PG_VAO_USER}";

GRANT USAGE ON SCHEMA doc TO "${PG_VAO_DOCUMENT_USER}";
GRANT ALL ON ALL TABLES IN SCHEMA doc TO "${PG_VAO_DOCUMENT_USER}";
GRANT ALL ON ALL SEQUENCES IN SCHEMA doc TO "${PG_VAO_DOCUMENT_USER}";

GRANT USAGE ON SCHEMA back TO "${PG_VAO_USER}";
GRANT ALL ON ALL TABLES IN SCHEMA back TO "${PG_VAO_USER}";
GRANT ALL ON ALL SEQUENCES IN SCHEMA back TO "${PG_VAO_USER}";

GRANT USAGE ON SCHEMA front TO "${PG_VAO_USER}";
GRANT ALL ON ALL TABLES IN SCHEMA front TO "${PG_VAO_USER}";
GRANT ALL ON ALL SEQUENCES IN SCHEMA front TO "${PG_VAO_USER}";

GRANT USAGE ON SCHEMA referentiel TO "${PG_VAO_USER}";
GRANT ALL ON ALL TABLES IN SCHEMA referentiel TO "${PG_VAO_USER}";
GRANT ALL ON ALL SEQUENCES IN SCHEMA referentiel TO "${PG_VAO_USER}";
SQL

echo '03-1-geo-data : '
psql -d $POSTGRES_DB -f /scripts/03/03-1-geo-data.sql
echo '03-2-back-data : '
psql -d $POSTGRES_DB -f /scripts/03/03-2-back-data.sql
echo '03-3-ref-data : '
psql -d $POSTGRES_DB -f /scripts/03/03-3-ref-data.sql


echo 'BO-1-back-user : '
psql -d $POSTGRES_DB -f /seeds/BO-1-back-user.sql

