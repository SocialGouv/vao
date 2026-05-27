import { FeatureFlagName } from "../constantes";

export interface UserUsagersDto {
  id: string;
  mail: string;
  nom: string;
  prenom: string;
  createdAt: Date | null;
  roles?: string[];
  userSiret?: string;
  cguAccepted: boolean | null;
  cguAcceptedAt: Date | null;
  featureFlags?: Partial<Record<FeatureFlagName, boolean>>;
  otpCode?: number | null;
  otpCodeExpiresAt?: Date | null;
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
