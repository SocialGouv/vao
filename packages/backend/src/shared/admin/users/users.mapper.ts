import { UserAdminDto } from "@vao/shared-bridge";

import { UserAdminEntity } from "./users.entity";

/**
 * Mapper to convert database rows (snake_case) to DTOs (camelCase)
 */
export const UsersAdminMapper = {
  toDto: (entity: UserAdminEntity): UserAdminDto => {
    return {
      cguAccepted: entity.cgu_accepted,
      cguAcceptedAt: entity.cgu_accepted_at,
      dateCreation: entity.created_at,
      deleted: entity.deleted,
      deletedDate: entity.deleted_date,
      deletedUseId: entity.deleted_use_id,
      editedAt: entity.edited_at,
      email: entity.mail,
      enddate: entity.enddate,
      id: entity.id,
      lastConnectionAt: entity.lastconnection_at,
      nom: entity.nom,
      otpAttempts: entity.otp_attempts,
      otpAttemptsAt: entity.otp_attempts_at,
      otpCode: entity.otp_code,
      otpCodeExpiresAt: entity.otp_code_expires_at,
      prenom: entity.prenom,
      pwd: entity.pwd,
      roles: [],
      territoireCode: entity.ter_code,
      validated: entity.validated,
      validatedAt: entity.validated_at,
    };
  },
  toDtos: (entities: UserAdminEntity[]): UserAdminDto[] => {
    return entities.map((entity) => UsersAdminMapper.toDto(entity));
  },
};
