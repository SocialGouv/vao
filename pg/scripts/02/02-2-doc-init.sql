DROP SCHEMA IF EXISTS doc CASCADE;
CREATE SCHEMA doc;

/*==============================================================*/
/* Table : documents				                            */
/*==============================================================*/
CREATE TABLE doc.documents (
	uuid		uuid			NOT NULL DEFAULT gen_random_uuid(),
	category	VARCHAR(30)		NOT NULL,
	filename 	VARCHAR(100) 	NOT NULL,
	mime_type 	VARCHAR(100) 	NOT NULL,
	file 		BYTEA 			NOT NULL,
    created_at  TIMESTAMP       DEFAULT current_timestamp NOT NULL,
   	constraint pk_identites primary key (uuid)
);

GRANT USAGE ON SCHEMA doc TO vao_doc;

GRANT ALL ON ALL TABLES IN SCHEMA doc TO vao_doc;
GRANT ALL ON ALL SEQUENCES IN SCHEMA doc TO vao_doc;