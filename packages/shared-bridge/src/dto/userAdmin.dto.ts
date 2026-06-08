import { USER_COMPETENCE_BO } from "../constantes/users";
import type { UserBaseDto } from "./userBase.dto";

export interface UserAdminDto extends UserBaseDto {
  territoireCode: string;
  serviceCompetent?: USER_COMPETENCE_BO | null;

  // si vraiment obligatoire côté BO
  dateCreation: Date;
}
