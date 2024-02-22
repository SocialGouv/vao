-- Premier compte
INSERT INTO back.users (validated,deleted,mail,name,firstname,pwd,enddate,created_at,edited_at,auth_try,blocked)
VALUES (true,false,'laurent.scherer@sg.social.gouv.fr','Laurent','SCHERER','$2a$06$UonmnHnZmE5CT2S/ORS2M.BmfgxSJDQd/B7ktNdn.DixGm9.qZ1Ey','2024-01-01 00:00:00','2024-02-21 11:27:16.28218','2024-02-21 11:27:58.684815',0,null) RETURNING id;

-- Ajout de tous les rôles pour le superAdmin
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),1);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),2);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),3);
INSERT INTO back.user_roles VALUES (currval('back.users_id_seq'),4);