import { UserUsagersDto } from "@vao/shared-bridge";

import { UserUsagersEntity } from "./users.entity";

/**
 * Mapper to convert database rows (snake_case) to DTOs (camelCase)
 */
export const UsersUsagersMapper = {
  toDto: (entity: UserUsagersEntity): UserUsagersDto => {
    return {
      cguAccepted: entity.cgu_accepted,
      cguAcceptedAt: entity.cgu_accepted_at,
      createdAt: entity.created_at,
      deleted: entity.deleted,
      deletedDate: entity.deleted_date,
      deletedUseId: entity.deleted_use_id,
      editedAt: entity.edited_at,
      enddate: entity.enddate,
      id: entity.id,
      lastConnectionAt: entity.lastconnection_at,
      mail: entity.mail,
      nom: entity.nom,
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
  toDtos: (entities: UserUsagersEntity[]): UserUsagersDto[] => {
    return entities.map((entity) => UsersUsagersMapper.toDto(entity));
  },
};
