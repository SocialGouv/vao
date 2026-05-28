import { FeatureFlagName } from "../constantes";
import { USER_COMPETENCE_BO } from "../constantes/users";

export interface UserAdminDto {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  createdAt: Date | null;
  roles?: string[];
  territoireCode: string;
  cguAccepted: boolean | null;
  cguAcceptedAt: Date | null;
  serviceCompetent?: USER_COMPETENCE_BO | null;
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
