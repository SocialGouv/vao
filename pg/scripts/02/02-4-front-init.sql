\c vao;

DROP SCHEMA IF EXISTS front CASCADE;           -- données spécifiques au portail PP
CREATE SCHEMA front;

CREATE TYPE user_status AS ENUM (
  'NEED_EMAIL_VALIDATION',
  'VALIDATED',
  'BLOCKED'
);

/*==============================================================*/
/* Table : users                                                */
/*==============================================================*/
create table front.users (
   id                           SERIAL               NOT NULL,
   mail                         VARCHAR(320)         UNIQUE NULL,
   pwd                          VARCHAR(255)         DEFAULT NULL,
   nom                          VARCHAR(40)          NOT NULL,
   prenom                       VARCHAR(40)          NOT NULL,
   status_code                  user_status          NOT NULL,
   deleted                      BOOLEAN              NOT NULL DEFAULT false,
   verified                     timestamp            DEFAULT current_timestamp NOT NULL,
   created_at                   timestamp            DEFAULT current_timestamp NOT NULL,
   edited_at                    timestamp            DEFAULT current_timestamp NOT NULL,
   constraint pk_users primary key (id)
);

/*==============================================================*/
/* Table : sessions                                             */
/*==============================================================*/
create table front.sessions (
   id                   SERIAL               NOT NULL,
   cle                  VARCHAR(50)          NOT NULL,
   refresh_token        VARCHAR(200)         NOT NULL,
   created_at           TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_session primary key (refresh_token)
);

/*==============================================================*/
/* Table : operateur                                            */
/*==============================================================*/
create table front.operateurs (
   id                           SERIAL               NOT NULL,
   supprime                     BOOLEAN              NOT NULL DEFAULT false,
   personne_morale              JSONB                ,
   personne_physique            JSONB                ,
   created_at                   TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at                    TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_operateurs    primary key (id)
);

/*==============================================================*/
/* Table : user_operateur                                       */
/*==============================================================*/
create table front.user_operateur (
   use_id                       INTEGER              NOT NULL REFERENCES front.users(id) ON DELETE CASCADE,
   ope_id                       INTEGER              NOT NULL REFERENCES front.operateurs(id) ON DELETE CASCADE,
   constraint pk_user_operateur primary key (use_id,ope_id)
);

/*==============================================================*/
/* Table : agrements				                                  */
/*==============================================================*/
CREATE TABLE front.agrements (
	uuid                      		uuid              		NOT NULL,
   operateur_id                  INTEGER                 NOT NULL REFERENCES front.operateurs(id),
	numero                        VARCHAR(10)             NOT NULL,
   region_delivrance             VARCHAR(4)              NOT NULL,
   date_obtention                DATE                    NOT NULL,
   date_fin_validite             DATE                    NOT NULL,
   created_at                   TIMESTAMP                DEFAULT current_timestamp NOT NULL,
   constraint pk_agrements primary key (uuid)
);
CREATE TYPE sejour_status AS ENUM (
   'BROUILLON', 
   'TRANMISE', 
   'EN COURS', 
   'A MODIFIER',
   'EN ATTENTE VALIDATION HEBERGEMENT',
   'EN ATTENTE DECLARATION 8 JOURS',
   'VALIDEE',
   'REFUSEE'
);

/*==============================================================*/
/* Table : demande_sejour                                       */
/*==============================================================*/
create table front.demande_sejour (
   id                           SERIAL               NOT NULL,
   statut                       sejour_status        NOT NULL,
   user_id                      INTEGER              NOT NULL REFERENCES front.users(id),
   operateur_id                 INTEGER              NOT NULL REFERENCES front.operateurs(id),
   id_fonctionnelle             VARCHAR(10)          ,
   libelle                      VARCHAR(50)          NOT NULL,
   date_debut                   DATE                 NOT NULL,
   date_fin                     DATE                 NOT NULL,
   itinerant                    BOOLEAN              DEFAULT false NOT NULL,
   itinerant_etranger           BOOLEAN              DEFAULT false NOT NULL,
   duree                        INTEGER              DEFAULT 1 NOT NULL,
   nb_hebergement               INTEGER              ,
   herbergement                 JSONB                ,
   vacanciers                   JSONB                ,
   personnel                    JSONB                ,
   transport                    JSONB                ,
   operateur                    JSONB                ,
   projet_sejour                JSONB                ,
   sanitaires                   JSONB                ,
   created_at                   TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at                    TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_demande_sejour primary key (id)
);

/*==============================================================*/
/* Table : demande_sejour                                       */
/*==============================================================*/
create table front.hebergement (
   id                           SERIAL               NOT NULL,
   type_hebergement             VARCHAR(15)          NOT NULL,
   nom                          VARCHAR(40)          NOT NULL,
   adresse                      JSONB                ,
   created_at                   TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at                    TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_hebergement primary key (id)
);

GRANT USAGE ON SCHEMA front TO u_front;
GRANT USAGE ON SCHEMA front TO u_back;

GRANT ALL ON ALL TABLES IN SCHEMA front TO u_front;
GRANT ALL ON ALL SEQUENCES IN SCHEMA front TO u_front;
GRANT ALL ON ALL TABLES IN SCHEMA front TO u_back;
GRANT ALL ON ALL SEQUENCES IN SCHEMA front TO u_back;
