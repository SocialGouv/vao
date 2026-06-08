import { FeatureFlagName } from "../constantes";

export interface UserUsagersDto {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  dateCreation: Date | null;
  roles?: string[];
  userSiret?: string;
  cguAccepted: boolean | null;
  cguAcceptedAt: Date | null;
  featureFlags?: Partial<Record<FeatureFlagName, boolean>>;
  requires2FA?: boolean | null;
  otpCode?: number | null;
  otpCodeExpiresAt?: Date | null;
  otpAttempts?: number | null;
  otpAttemptsAt?: Date | null;
  deleted?: boolean | null;
  deletedDate?: Date | null;
  deletedUseId?: number | null;
  editedAt?: Date | null;
  enddate?: Date | null;
  lastConnectionAt?: Date | null;
  validated?: boolean | null;
  validatedAt?: Date | null;
  pwd: string;
}
