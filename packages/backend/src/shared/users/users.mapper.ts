// shared/users/users.mapper.ts

import { UserEntity } from "./users.entity";

export const mapUserBase = (entity: UserEntity) => ({
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
  validated: entity.validated,
  validatedAt: entity.validated_at,
});
