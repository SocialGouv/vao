import { statusUserFront } from "@vao/shared-bridge";

import Logger from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = Logger(module.filename);

export const UserFactory = {
  create: async ({ user }: { user: any }) => {
    log.i("create - IN");

    const query = () => `
        INSERT INTO front.users (
            mail,
            pwd,
            status_code,
            nom,
            prenom,
            telephone,
            deleted,
            verified,
            created_at,
            edited_at,
            lastconnection_at,
            siret,
            ter_code,
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
            $13,
            $14,
            $15
        )
            RETURNING id, mail AS email, nom, prenom, cgu_accepted as "cguAccepted", ter_code as "territoireCode"
        `;
    const response = await getPool().query(query(), [
      user.email,
      user.password,
      user.status_code || statusUserFront.NEED_EMAIL_VALIDATION,
      user.nom,
      user.prenom,
      user.telephone || null,
      user?.deleted || false,
      user?.verified || new Date(),
      user?.created_at || new Date(),
      user?.edited_at || new Date(),
      user?.lastconnection_at || new Date(),
      user?.siret || null,
      user?.ter_code || null,
      user?.cgu_accepted_at || null,
      user?.cgu_accepted || false,
    ]);
    log.i("create - DONE");
    return { code: "CreationCompte", user: response.rows };
  },
};
