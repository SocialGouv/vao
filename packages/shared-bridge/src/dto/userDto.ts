export interface UserDto {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  dateCreation: string;
  roles: string[];
  territoireCode: string;
  userSiret: string;
  serviceCompetent: string;
}
