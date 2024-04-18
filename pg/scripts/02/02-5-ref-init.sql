/*==============================================================*/
/* Nom de SGBD :  PostgreSQL 11.6                               */
/* Date de création :  08/12/2022                               */
/*==============================================================*/

DROP SCHEMA IF EXISTS referentiel CASCADE;          -- données géographiques communes aux 3 portails
CREATE SCHEMA referentiel;

GRANT USAGE ON SCHEMA referentiel TO vao_u;


/*==============================================================*/
/* Table : territoires                                          */
/*==============================================================*/
create table referentiel.categorie_juridique (
   id               serial                not null,
   code             VARCHAR(4)            UNIQUE not null,
   libelle          VARCHAR(150)          ,
   constraint pk_categorie_juridique primary key (code)
);


GRANT ALL ON ALL TABLES IN SCHEMA referentiel TO vao_u;
GRANT ALL ON ALL SEQUENCES IN SCHEMA referentiel TO vao_u;
