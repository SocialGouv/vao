import { USER_COMPETENCE_BO } from "../constantes/users";

export interface UserDto {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  dateCreation: string;
  roles: string[];
  territoireCode: string;
  userSiret: string;
  cguAccepted: boolean;
  serviceCompetent?: USER_COMPETENCE_BO | null;
}
