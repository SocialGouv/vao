import { STATUS_USER_FRONT, UserUsagersDto } from "@vao/shared-bridge";

import { UserUsagersEntity } from "../../shared/usagers/users/users.entity";
import { UsersUsagersMapper } from "../../shared/usagers/users/users.mapper";
import { logger } from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = logger(module.filename);

export const UsersRepository = {
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
      user.password || null,
      user.status_code || STATUS_USER_FRONT.NEED_EMAIL_VALIDATION,
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
  getById: async ({ userId }: { userId: number }): Promise<UserUsagersDto> => {
    log.i("getById - IN");
    const query = `
      SELECT *
      FROM front.users
      WHERE id = $1
      `;
    const response = await getPool().query(query, [userId]);
    const row = response.rows[0] as UserUsagersEntity;
    const userAdminDto = UsersUsagersMapper.toDto(row);

    return userAdminDto;
  },
  updateOtpCode: async ({
    userId,
    otpCode,
    otpCodeExpiratedAt,
  }: {
    userId: number;
    otpCode: number;
    otpCodeExpiratedAt: Date | null;
  }): Promise<UserUsagersDto> => {
    log.i("getById - IN");
    const query = `
      UPDATE front.users
      SET
        otp_code = $2,
        otp_code_expires_at = $3
      WHERE id = $1
      RETURNING *
      `;
    const response = await getPool().query(query, [
      userId,
      otpCode,
      otpCodeExpiratedAt,
    ]);
    const row = response.rows[0] as UserUsagersEntity;
    const userUsagersDto = UsersUsagersMapper.toDto(row);

    return userUsagersDto;
  },
};
