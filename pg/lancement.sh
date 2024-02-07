#! /bin/sh
echo '01-init : '
psql -d ${PGDATABASE} -U ${PGUSER} -f /scripts/01-init.sql
echo '02-1-geo-init : '
psql -d ${PGDATABASE} -U ${PGUSER} -f /scripts/02/02-1-geo-init.sql
echo '02-2-pp-init : '
psql -d ${PGDATABASE} -U ${PGUSER} -f /scripts/02/02-2-doc-init.sql
echo '02-3-back-init : '
psql -d ${PGDATABASE} -U ${PGUSER} -f /scripts/02/02-3-back-init.sql
echo '02-4-front-init : '
psql -d ${PGDATABASE} -U ${PGUSER} -f /scripts/02/02-4-front-init.sql
echo '03-1-geo-data : '
psql -d ${PGDATABASE} -U ${PGUSER} -f /scripts/03/03-1-geo-data.sql
echo '03-2-back-data : '
psql -d ${PGDATABASE} -U ${PGUSER} -f /scripts/03/03-2-back-data.sql

