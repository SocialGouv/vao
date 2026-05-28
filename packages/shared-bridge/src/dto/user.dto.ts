import { FeatureFlagName } from "../constantes";
import { USER_COMPETENCE_BO } from "../constantes/users";

export interface UserDto {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  dateCreation: string;
  roles: string[];
  territoireCode: string;
  userSiret?: string;
  requires2FA?: boolean | null;
  cguAccepted: boolean | null;
  cguAcceptedAt: Date | null;
  serviceCompetent?: USER_COMPETENCE_BO | null;
  featureFlags?: Partial<Record<FeatureFlagName, boolean>>;
  otpCode?: number | null;
  otpCodeExpiresAt?: Date | null;
  createdAt?: Date | null;
}
