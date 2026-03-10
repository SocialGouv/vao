-- Compte par défaut nécessaire pour les tests e2e
-- mot de passe : Azertyuiop1!
INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'admin.national@example.com','Admin','NATIONAL',crypt('Azertyuiop1!', gen_salt('bf')), 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

-- Compte par défaut pour la région IDF
INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'region.idf@example.com','Région','IDF',crypt('Azertyuiop1!', gen_salt('bf')), 'IDF', now()) RETURNING id;

INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

-- Compte par défaut pour le département Paris (75)
INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'departement.75@example.com','Département','PARIS',crypt('Azertyuiop1!', gen_salt('bf')), '75', now()) RETURNING id;

INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

--------------------------------------------------
-- TNR
--------------------------------------------------
INSERT INTO back.users (validated,mail,prenom,nom,pwd,ter_code,enddate)
VALUES (true,'tnra.agent.idf@example.com','IDF','TNRA',crypt('Azertyuiop1!', gen_salt('bf')), 'IDF',now()) RETURNING id;

-- Ajout des rôles regional
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),6);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),7);
