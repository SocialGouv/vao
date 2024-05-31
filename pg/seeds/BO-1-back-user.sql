-- Premier compte
INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'laurent.scherer@sg.social.gouv.fr','Laurent','SCHERER','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'vincent.carcel@sg.social.gouv.fr','Vincent','CARCEL','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);


INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'benjamin.pinard@sg.social.gouv.fr','Benjamin','PINARD','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);


INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'gweill@guigops.fr','Guillaume','WEILL','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);


INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'olivier.toumsy@sg.social.gouv.fr','Olivier','TOUMSY','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);


INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'assia.rachedi@sg.social.gouv.fr','Assia','RACHEDI','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'boubeker.ait-aider@social.gouv.fr','Boubeker','AIT-AIDER','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'nelly.jousset-antiphon@social.gouv.fr','Nelly','JOUSSET-ANTIPHON','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);

INSERT INTO back.users (validated, mail,prenom,nom,pwd, ter_code, enddate)
VALUES (true,'romain.pontefract@social.gouv.fr','Romain','PONTEFRACT','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey', 'FRA', now()) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),5);
