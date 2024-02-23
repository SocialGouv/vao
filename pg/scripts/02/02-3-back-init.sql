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
   CONSTRAINT pk_back_users PRIMARY KEY (id)
);

/*==============================================================*/
/* Table : user_roles                                           */
/*==============================================================*/
CREATE TABLE back.user_roles (
   use_id             INT               NOT NULL REFERENCES back.users(id) ON DELETE CASCADE,
   rol_id             INT               NOT NULL REFERENCES back.roles(id) ON DELETE CASCADE,
   CONSTRAINT pk_user_roles PRIMARY KEY (use_id,rol_id)
);

/*==============================================================*/
/* Table : user_territoires                                     */
/*==============================================================*/
CREATE TABLE back.user_territoires (
   use_id             INT               NOT NULL REFERENCES back.users(id) ON DELETE CASCADE,
   ter_code           VARCHAR(4)        NOT NULL REFERENCES geo.territoires(code),
   CONSTRAINT pk_user_geo PRIMARY KEY (use_id,ter_code)
);


GRANT USAGE ON SCHEMA back TO vao;

GRANT ALL ON ALL TABLES IN SCHEMA back TO vao;
GRANT ALL ON ALL SEQUENCES IN SCHEMA back TO vao;