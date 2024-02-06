\c document;

DROP SCHEMA IF EXISTS doc CASCADE;
CREATE SCHEMA doc;

/*==============================================================*/
/* Table : agrements				                            */
/*==============================================================*/
CREATE TABLE doc.agrements (
	uuid		uuid			NOT NULL DEFAULT gen_random_uuid(),
	filename 	VARCHAR(100) 	NOT NULL,
	mime_type 	VARCHAR(30) 	NOT NULL,
	file 		BYTEA 			NOT NULL,
   	constraint pk_identites primary key (uuid)
);

GRANT USAGE ON SCHEMA doc TO u_front;
GRANT USAGE ON SCHEMA doc TO u_back;

GRANT ALL ON ALL TABLES IN SCHEMA doc TO u_front;
GRANT ALL ON ALL SEQUENCES IN SCHEMA doc TO u_front;
GRANT ALL ON ALL TABLES IN SCHEMA doc TO u_back;
GRANT ALL ON ALL SEQUENCES IN SCHEMA doc TO u_back;