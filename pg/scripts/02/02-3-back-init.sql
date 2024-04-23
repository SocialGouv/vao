DROP SCHEMA IF EXISTS back CASCADE;          -- données spécifiques au portail back
CREATE SCHEMA back;

/*==============================================================*/
/* Table : roles                                                */
/*==============================================================*/
CREATE TABLE back.roles (
   id             INT                      NOT NULL,
   label          VARCHAR(50)              NOT NULL,
   CONSTRAINT pk_roles PRIMARY KEY (id)
);

/*==============================================================*/
/* Table : users                                                */
/*==============================================================*/
CREATE TABLE back.users (
   id                 SERIAL               NOT NULL,
   validated          BOOLEAN              default false,
   deleted            BOOLEAN              default false,
   mail               VARCHAR(320)          UNIQUE NOT NULL,
   prenom             VARCHAR(128)          NULL,
   nom                VARCHAR(128)          NULL,
   pwd                VARCHAR(255)         NULL,
   enddate            TIMESTAMP            NOT NULL,
   created_at         TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   edited_at          TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   auth_try           INT                  NOT NULL default 0,
   blocked            TIMESTAMP            NULL,
   ter_code           VARCHAR(4)           NOT NULL REFERENCES geo.territoires(code),
   CONSTRAINT pk_back_users PRIMARY KEY (id)
);

/*==============================================================*/
/* Table : sessions                                             */
/*==============================================================*/
create table back.sessions (
   id                   SERIAL               NOT NULL,
   cle                  VARCHAR(50)          NOT NULL,
   refresh_token        VARCHAR(400)         NOT NULL,
   created_at           TIMESTAMP            DEFAULT current_timestamp NOT NULL,
   constraint pk_session primary key (refresh_token)
);

/*==============================================================*/
/* Table : user_roles                                           */
/*==============================================================*/
CREATE TABLE back.user_roles (
   use_id             INT               NOT NULL REFERENCES back.users(id) ON DELETE CASCADE,
   rol_id             INT               NOT NULL REFERENCES back.roles(id) ON DELETE CASCADE,
   CONSTRAINT pk_user_roles PRIMARY KEY (use_id,rol_id)
);


GRANT USAGE ON SCHEMA back TO vao;

GRANT ALL ON ALL TABLES IN SCHEMA back TO vao;
GRANT ALL ON ALL SEQUENCES IN SCHEMA back TO vao;
