/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 11.6                               */
/* Date de création :  08/12/2022                               */
/*==============================================================*/

DROP SCHEMA IF EXISTS geo CASCADE;          -- données géographiques communes aux 3 portails
CREATE SCHEMA geo;

GRANT USAGE ON SCHEMA geo TO vao;


/*==============================================================*/
/* Table : territoires                                          */
/*==============================================================*/
create table geo.territoires (
   id               BIGINT                not null,
   code             VARCHAR(4)            UNIQUE not null,
   parent_code      VARCHAR(15)           null,
   label            VARCHAR(50)           not null,
   constraint pk_departements primary key (code)
);


/*==============================================================*/
/* Table : COMMUNES                                             */
/*==============================================================*/
create table geo.communes (
   id               serial               NOT NULL,
   code_insee       VARCHAR(5)           NOT NULL,
   label            VARCHAR(50)          NOT NULL,
   code             VARCHAR(4)           NOT NULL REFERENCES geo.territoires(code),
   date_debut       timestamp            NOT NULL,
   date_fin         timestamp            NULL,
   constraint pk_communes primary key (id)
);

GRANT SELECT ON ALL TABLES IN SCHEMA geo TO vao;
GRANT ALL ON ALL SEQUENCES IN SCHEMA geo TO vao;