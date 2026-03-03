import { FeatureFlagName } from "../constantes";

export interface UserDto {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  dateCreation: string;
  roles: string[];
  territoireCode: string;
  userSiret: string;
  serviceCompetent?: string;
  cguAccepted: boolean;
  featureFlags?: Partial<Record<FeatureFlagName, boolean>>;
}
