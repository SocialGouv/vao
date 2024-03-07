-- Admîn national : Territoire = France
INSERT INTO back.user_territoires  VALUES ((select max(id) from back.users),'FRA');
