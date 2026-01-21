import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);

export const UsersRepository = {
  create: async ({ user }: { user: any }) => {
    log.i("create - IN");

    const query = () => `
      INSERT INTO back.users (
          mail,
          pwd,
          validated,
          deleted,
          nom,
          prenom,
          ter_code,
          created_at,
          enddate,
          validated_at,
          lastconnection_at,
          cgu_accepted_at,
          cgu_accepted
        )
        VALUES (
          $1,
          crypt($2, gen_salt('bf')),
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13
        )
            RETURNING id, mail AS email, nom, prenom, cgu_accepted as "cguAccepted", ter_code as "territoireCode"
        `;
    const response = await getPool().query(query(), [
      user.email,
      user.password || null,
      user?.validated || false,
      user?.deleted || false,
      user.nom,
      user.prenom,
      user.ter_code || null,
      user?.created_at || new Date(),
      user?.enddate || new Date(),
      user?.validated_at || new Date(),
      user?.lastconnection_at || new Date(),
      user?.cgu_accepted_at || null,
      user?.cgu_accepted || false,
    ]);
    log.i("create - DONE");
    return { code: "CreationCompte", user: response.rows };
  },
};
