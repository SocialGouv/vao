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
  getByEmail: async ({
    email,
  }: {
    email: string;
  }): Promise<UserUsagersDto | null> => {
    log.i("getByEmail - IN");
    const query = `
        SELECT *
        FROM front.users
        WHERE mail = $1
        `;
    const response = await getPool().query(query, [email]);
    const row = response.rows[0] as UserUsagersEntity;
    if (!row) {
      return null;
    }
    const userUsagersDto = UsersUsagersMapper.toDto(row);

    return userUsagersDto;
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
  getByIdForLogin: async (userId: number): Promise<any> => {
    log.i("getById - IN");
    const query = `
      SELECT   us.id,
        us.mail as email,
        us.pwd is not null as "hasPwd",
        us.nom,
        us.prenom,
        us.telephone,
        us.status_code as "statusCode",
        pm.siret as "siret",
        pm.raison_sociale as "raisonSociale",
        us.cgu_accepted as "cguAccepted",
        us.otp_code_expires_at AS "otpCodeExpiresAt",
        us.otp_attempts AS "otpAttempts",
        us.otp_attempts_at AS "otpAttemptsAt",
        (
          SELECT COALESCE(jsonb_agg(r.label), '[]'::jsonb)
          FROM front.roles r
          INNER JOIN front.user_roles ur ON ur.rol_id = r.id
          WHERE ur.use_id = us.id
        ) AS "roles"
      FROM front.users us
      LEFT JOIN front.user_organisme uo ON us.id = uo.use_id
      LEFT JOIN front.organismes o ON uo.org_id = o.id
      LEFT JOIN front.personne_morale pm ON pm.organisme_id = o.id AND pm.current = TRUE
      WHERE us.id = $1
      `;
    const response = await getPool().query(query, [userId]);
    return response.rows[0];
  },
  updateOtp: async ({
    userId,
    otpAttempts,
    otpAttemptsAt,
    otpCode,
    otpCodeExpiresAt,
  }: {
    userId: number;
    otpAttempts: number;
    otpAttemptsAt: Date | null;
    otpCode: number | null;
    otpCodeExpiresAt: Date | null;
  }): Promise<UserUsagersDto> => {
    log.i("getById - IN");
    const query = `
        UPDATE front.users
        SET
          otp_attempts = $2,
          otp_attempts_at = $3,
          otp_code= $4,
          otp_code_expires_at = $5
        WHERE id = $1
        RETURNING *
        `;
    const response = await getPool().query(query, [
      userId,
      otpAttempts,
      otpAttemptsAt,
      otpCode,
      otpCodeExpiresAt,
    ]);
    const row = response.rows[0] as UserUsagersEntity;
    const userUsagersDto = UsersUsagersMapper.toDto(row);

    return userUsagersDto;
  },
};
