import type { UserBaseDto } from "./userBase.dto";

export interface UserUsagersDto extends UserBaseDto {
  userSiret?: string;
}
