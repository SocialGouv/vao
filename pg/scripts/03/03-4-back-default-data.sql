-- Compte par défaut nécessaire pour les tests e2e
-- mot de passe : Azertyuiop1!
INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'admin.national@vao.fr','Admin','NATIONAL','$2a$06$x4CMYcpEGMXTI61yjRHVXeQnRQLBpY/T5XdSyVhkQxU43vryWOY.e', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

-- Compte par défaut pour la région IDF
INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'region.idf@vao.fr','Région','IDF','$2a$06$x4CMYcpEGMXTI61yjRHVXeQnRQLBpY/T5XdSyVhkQxU43vryWOY.e', 'IDF', now()) RETURNING id;

INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

-- Compte par défaut pour le département Paris (75)
INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'departement.75@vao.fr','Département','PARIS','$2a$06$x4CMYcpEGMXTI61yjRHVXeQnRQLBpY/T5XdSyVhkQxU43vryWOY.e', '75', now()) RETURNING id;

INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);
