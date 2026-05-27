import { UserAdminDto, UserAdminEntity } from "@vao/shared-bridge";

import { UsersAdminMapper } from "../../shared/admin/users/users.mapper";
import { logger } from "../../utils/logger";
import { getPool } from "../../utils/pgpool";

const log = logger(module.filename);

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
  getById: async ({ userId }: { userId: number }): Promise<UserAdminDto> => {
    log.i("getById - IN");
    const query = `
      SELECT *
      FROM back.users
      WHERE id = $1
      `;
    const response = await getPool().query(query, [userId]);
    const row = response.rows[0] as UserAdminEntity;
    const userAdminDto = UsersAdminMapper.toDto(row);

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
  }): Promise<UserAdminDto> => {
    log.i("getById - IN");
    const query = `
      UPDATE back.users
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
    const row = response.rows[0] as UserAdminEntity;
    const userAdminDto = UsersAdminMapper.toDto(row);

    return userAdminDto;
  },
};
